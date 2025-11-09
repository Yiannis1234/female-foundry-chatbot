import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { readFile, writeFile } from "fs/promises";
import OpenAI from "openai";
import { randomUUID } from "crypto";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(join(__dirname, "public")));

const PORT = process.env.PORT || 3000;
const INDEX_PATH = join(__dirname, "data/index.json");
const LOG_PATH = join(__dirname, "data/logs.json");

// API key should be set via environment variable OPENAI_API_KEY
const API_KEY = process.env.OPENAI_API_KEY?.trim();
const openaiClient = API_KEY && new OpenAI({ apiKey: API_KEY });

async function loadIndex() {
  const raw = await readFile(INDEX_PATH, "utf8");
  return JSON.parse(raw);
}

async function readLogs() {
  const raw = await readFile(LOG_PATH, "utf8");
  return JSON.parse(raw);
}

async function appendLog(entry) {
  const logs = await readLogs().catch(() => []);
  logs.push(entry);
  await writeFile(LOG_PATH, JSON.stringify(logs, null, 2));
}

function scoreEntry(entry, message) {
  const tokens = message
    .toLowerCase()
    .replace(/[^a-z0-9\s]/gi, " ")
    .split(/\s+/)
    .filter(Boolean);
  const haystack = `${entry.title} ${entry.question} ${entry.answer} ${entry.tags.join(" ")}`.toLowerCase();
  const hits = tokens.reduce((acc, token) => (haystack.includes(token) ? acc + 1 : acc), 0);
  return hits / Math.max(tokens.length, 1);
}

async function findRelevantEntries(message, limit = 3) {
  const index = await loadIndex();
  return index
    .map((entry) => ({ entry, score: scoreEntry(entry, message) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .filter(({ score }) => score > 0);
}

function buildPrompt(message, entries) {
  const context = entries
    .map(
      ({ entry }) =>
        `Title: ${entry.title}\nQuestion: ${entry.question}\nAnswer: ${entry.answer}\nTags: ${entry.tags.join(", ")}`
    )
    .join("\n\n");

  return [
    {
      role: "system",
      content: [
        "You are the Female Foundry assistant. Answer using the provided context.",
        "If you cannot find an answer in context, suggest escalating the conversation to a human via email.",
        "Respect privacy: never request sensitive personal data.",
      ].join(" "),
    },
    {
      role: "assistant",
      content: context ? `Context:\n${context}` : "No context available.",
    },
    {
      role: "user",
      content: message,
    },
  ];
}

async function generateAnswer(message, entries) {
  if (!openaiClient) {
    // Fallback heuristic response using best match.
    const best = entries[0]?.entry;
    if (best) {
      return `${best.answer}\n\n_Source: ${best.title}_`;
    }
    return "I do not have that information yet. Would you like me to connect you with a team member at Female Foundry?";
  }

  try {
    const response = await openaiClient.chat.completions.create({
      model: "gpt-4o-mini",
      messages: buildPrompt(message, entries),
      temperature: 0.3,
    });
    const content = response?.choices?.[0]?.message?.content?.trim();
    return (
      content ||
      "I could not formulate a response right now. Would you like me to escalate this to a team member?"
    );
  } catch (error) {
    console.error("LLM request failed:", error);
    return "I ran into a technical issue while contacting the AI service. Let me connect you with a human teammate instead.";
  }
}

app.get("/api/health", (_, res) => res.json({ status: "ok" }));

app.post("/api/chat", async (req, res) => {
  const { message, userId = "anonymous" } = req.body;
  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "Message is required." });
  }

  const relevantEntries = await findRelevantEntries(message);
  const answer = await generateAnswer(message, relevantEntries);

  const logEntry = {
    id: randomUUID(),
    userId,
    message,
    answer,
    matchedEntries: relevantEntries.map(({ entry, score }) => ({ id: entry.id, score })),
    timestamp: new Date().toISOString(),
  };

  await appendLog(logEntry);

  res.json({
    reply: answer,
    sources: relevantEntries.map(({ entry }) => ({
      id: entry.id,
      title: entry.title,
    })),
    logId: logEntry.id,
  });
});

app.listen(PORT, () => {
  console.log(`LLM MVP server listening on http://localhost:${PORT}`);
});

