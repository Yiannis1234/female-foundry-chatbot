# Female Foundry Chatbot MVP

This mini-project shows how a Wix/Velo widget could call into an LLM-backed service, fetch answers from the Female Foundry "Index" dataset, and log conversations for analysis.

The stack is intentionally simple so you can demo locally, then translate the patterns into Wix HTTP functions or an external serverless setup.

## Features

- Browser chat UI that mimics an embedded Wix widget.
- Express backend with a `/api/chat` endpoint.
- Lightweight retrieval against `data/index.json` to supply context.
- Optional OpenAI integration (`gpt-4o-mini` by default). Falls back to FAQ answers when no API key is set.
- Conversation logging to `data/logs.json` for analytics and continuous improvement.

## Prerequisites

- Node.js 18+
- npm or pnpm
- OpenAI API key (optional for live LLM responses)

## Quick Start

```bash
cd "/Users/ioannisvamvakas/FEMALE FOUNDRY/llm-mvp"
npm install
cp env.example .env       # optional: add your OpenAI API key
npm run start             # starts on http://localhost:3000
```

Open `http://localhost:3000` in your browser and ask a question.

If you omit an OpenAI key the server will respond with the best FAQ match and show how escalation works when no answer is found.

## Project Layout

```
llm-mvp/
├── data/
│   ├── index.json     # "Index" dataset used for retrieval
│   └── logs.json      # Conversation logs written at runtime
├── public/
│   ├── index.html     # Demo widget UI
│   ├── app.js         # Frontend chat logic
│   └── styles.css
├── server.js          # Express + OpenAI integration
├── env.example        # Copy to .env and fill in secrets
└── package.json
```

## Extending the MVP

- **Swap data source**: Replace `data/index.json` with a call to Wix Data or Airtable. Map each record to the same structure.
- **Improve retrieval**: Add embeddings (OpenAI, Cohere) and store vectors in Supabase or Pinecone. Use cosine similarity instead of keyword counting.
- **Production logging**: Send log entries to a managed database or analytics pipeline, and redact PII before storage.
- **Human handover**: Trigger email or create a CRM ticket when the bot lacks confidence.
- **Wix integration**: Migrate `server.js` logic into a Wix HTTP function or host the endpoint externally and call it via `fetch` inside a Velo component.

## Demo Script for Stakeholders

1. Ask “How do I join the community?” – returns membership instructions (FAQ match).
2. Ask “What happens to my data?” – shows privacy policy snippet.
3. Ask something unknown – bot offers human escalation, demonstrating fallback.
4. Show `data/logs.json` to highlight audit logs and analytics potential.

## Next Steps (Suggested)

- Finalise MVP scope during kickoff using the checklist.
- Confirm data/privacy expectations and retention windows.
- Decide on hosting (Wix backend vs. external) and LLM provider based on budget and compliance.
- Turn this prototype into a milestone plan (e.g., discovery, integration, QA, launch).

