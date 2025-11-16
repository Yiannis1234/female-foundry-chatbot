const PRIMARY_OPTIONS = ["Website", "Programs", "Contact"];

const SECONDARY_OPTIONS = {
  Website: ["Female Innovation Index", "Community Overview", "Sunday Newsletter"],
  Programs: ["AI Visionaries", "AI Hustle Clinics", "Join Female Foundry"],
  Contact: ["Press & Media", "Partners", "Direct Email"],
};

const PRIMARY_KEYWORDS = {
  website: "Website",
  site: "Website",
  homepage: "Website",
  program: "Programs",
  incubator: "Programs",
  accelerator: "Programs",
  visionaries: "Programs",
  hustle: "Programs",
  contact: "Contact",
  email: "Contact",
  press: "Contact",
  partner: "Contact",
};

const SECONDARY_KEYWORDS = {
  index: "Female Innovation Index",
  survey: "Female Innovation Index",
  data: "Female Innovation Index",
  community: "Community Overview",
  members: "Community Overview",
  newsletter: "Sunday Newsletter",
  sunday: "Sunday Newsletter",
  "ai visionaries": "AI Visionaries",
  visionaries: "AI Visionaries",
  "ai hustle": "AI Hustle Clinics",
  hustle: "AI Hustle Clinics",
  join: "Join Female Foundry",
  apply: "Join Female Foundry",
  press: "Press & Media",
  media: "Press & Media",
  partner: "Partners",
  sponsors: "Partners",
  email: "Direct Email",
};

const INFO_MAP = {
  "Female Innovation Index":
    "• 1,215 founders and investors fed the 2025 Female Innovation Index.\n• Tracks 145,038 European companies to reveal the full innovation funnel.\n• Use it to benchmark capital flows, bottlenecks, and emerging female-led opportunities.",
  "Community Overview":
    "• 7,000+ founders, operators, and investors exchange deals and support inside the Female Foundry community.\n• Members tap curated introductions, campaigns, and shared resources.\n• Join to showcase your story or find collaborators.",
  "Sunday Newsletter":
    "• Weekly digest with funding news, GTM tactics, and macro insight.\n• Short, skimmable, and focused on female innovation wins.\n• Perfect for staying ahead of ecosystem signals every Sunday.",
  "AI Visionaries":
    "• Flagship incubator with Google Cloud for frontier AI builders.\n• Includes mentor office hours, GTM playbooks, and live showcases.\n• Cohorts spotlight visionary founders shaping AI for good.",
  "AI Hustle Clinics":
    "• Monthly 1-hour small-group sessions with Agata Nowicka.\n• Ideal for troubleshooting GTM, fundraising narratives, or warm introductions.\n• Free to join—limited to three founders each month for deep focus.",
  "Join Female Foundry":
    "• Fast-track your entry into the community and programs with one form.\n• Share your stage, focus, and asks to unlock tailored support.\n• Expect a welcome note and next steps within five business days.",
  "Press & Media":
    "• Grab media kits, founder stories, and the latest research pull quotes.\n• Perfect for reporters covering venture, AI, or inclusive innovation.\n• Dedicated inbox ensures you hear back within one business day.",
  Partners:
    "• Trusted by Carta, Accenture, LSEG, Cooley, Google Cloud, HSBC Innovation Banking, and more.\n• Partner benefits include bespoke research, campaigns, and curated founder intros.\n• Ideal for corporates and funds backing female-led innovation.",
  "Direct Email":
    "• Reach the core team directly at HELLO@FEMALEFOUNDRY.CO.\n• Address: 11 Welbeck Street, W1G 9XZ, London.\n• Expect a personal reply in under 24 hours on business days.",
};

const CTA_LINKS = {
  "Female Innovation Index": "https://www.femalefoundry.co/#female-innovation-index",
  "Community Overview": "https://www.femalefoundry.co/#community",
  "Sunday Newsletter": "https://www.femalefoundry.co/#newsletter",
  "AI Visionaries": "https://www.femalefoundry.co/#ai-visionaries",
  "AI Hustle Clinics": "https://www.femalefoundry.co/#ai-hustle",
  "Join Female Foundry": "https://www.femalefoundry.co/#join",
  "Press & Media": "https://www.femalefoundry.co/#media",
  Partners: "https://www.femalefoundry.co/#partners",
  "Direct Email": "mailto:hello@femalefoundry.co",
};

const sessions = {};

export async function post_session(request) {
  const sessionId = createSessionId();
  sessions[sessionId] = createSessionState();
  return jsonResponse(buildPayload(sessionId));
}

export async function post_chat(request) {
  let body = {};
  try {
    body = await request.body.json();
  } catch (error) {
    return jsonResponse({ error: "Invalid JSON body." }, 400);
  }

  const { session_id: sessionId, message } = body || {};

  if (!sessionId || !sessions[sessionId]) {
    return jsonResponse({ error: "Session not found. Please refresh the chat." }, 400);
  }

  const session = sessions[sessionId];
  const trimmed = (message || "").trim();

  if (!trimmed) {
    return jsonResponse({ error: "Empty message." }, 400);
  }

  session.history.push({ role: "user", content: trimmed });

  const lower = trimmed.toLowerCase();

  if (session.stage === "ask_name") {
    session.visitorName = titleCase(trimmed.split(" ")[0] || "friend");
    session.stage = "primary_menu";
    const intro = {
      role: "bot",
      content: `Nice to meet you, ${session.visitorName}! What would you like to explore?`,
    };
    session.history.push(intro);
    return jsonResponse(buildPayload(sessionId, PRIMARY_OPTIONS));
  }

  const matchedPrimary = detectMatch(PRIMARY_KEYWORDS, lower);
  const matchedSecondary = detectMatch(SECONDARY_KEYWORDS, lower);

  // Handle primary option clicks or keyword matches
  if (PRIMARY_OPTIONS.includes(trimmed) || matchedPrimary) {
    const choice = PRIMARY_OPTIONS.includes(trimmed) ? trimmed : matchedPrimary;
    session.primaryChoice = choice;
    session.stage = "secondary_menu";
    const prompt = {
      role: "bot",
      content: `Great — let's focus on ${choice}. Pick a spotlight topic.`,
    };
    session.history.push(prompt);
    return jsonResponse(buildPayload(sessionId, SECONDARY_OPTIONS[choice]));
  }

  const activeSecondaries =
    (session.primaryChoice && SECONDARY_OPTIONS[session.primaryChoice]) || [];

  const userSelectedSecondary =
    activeSecondaries.includes(trimmed) ||
    (matchedSecondary && activeSecondaries.includes(matchedSecondary))
      ? matchedSecondary || trimmed
      : null;

  if (userSelectedSecondary) {
    const info = infoBlock(userSelectedSecondary);
    session.history.push({ role: "bot", content: info });
    session.history.push({
      role: "bot",
      content: "Want to keep exploring? Tap another option below.",
    });
    session.stage = "primary_menu";
    session.primaryChoice = null;
    return jsonResponse(buildPayload(sessionId, PRIMARY_OPTIONS));
  }

  if (matchedSecondary && INFO_MAP[matchedSecondary]) {
    const info = infoBlock(matchedSecondary);
    session.history.push({ role: "bot", content: info });
    session.history.push({
      role: "bot",
      content: "Need anything else? Choose another path.",
    });
    session.stage = "primary_menu";
    session.primaryChoice = null;
    return jsonResponse(buildPayload(sessionId, PRIMARY_OPTIONS));
  }

  const fallback = {
    role: "bot",
    content: fallbackMessage(trimmed),
  };
  session.history.push(fallback);

  const nextOptions =
    session.stage === "secondary_menu" && session.primaryChoice
      ? SECONDARY_OPTIONS[session.primaryChoice]
      : PRIMARY_OPTIONS;

  return jsonResponse(buildPayload(sessionId, nextOptions));
}

function buildPayload(sessionId, options = []) {
  const session = sessions[sessionId];
  return {
    session_id: sessionId,
    stage: session.stage,
    primary_choice: session.primaryChoice,
    messages: session.history,
    options,
  };
}

function createSessionState() {
  return {
    stage: "ask_name",
    visitorName: null,
    primaryChoice: null,
    history: [
      {
        role: "bot",
        content:
          "Hi! I'm the Female Foundry assistant. What's your name?",
      },
    ],
  };
}

function createSessionId() {
  return `ff_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function detectMatch(table, text) {
  const keyword = Object.keys(table).find((key) => text.includes(key));
  return keyword ? table[keyword] : null;
}

function infoBlock(selection) {
  const base = INFO_MAP[selection] || "";
  const link = CTA_LINKS[selection];
  if (link) {
    return `${base}\n\nVisit: ${link}`;
  }
  return base;
}

function fallbackMessage(text) {
  return [
    "I don't have that exact snippet yet, but here's how to find it:",
    "• Tap Website → Female Innovation Index for the latest data cuts.",
    "• Tap Programs to join AI Visionaries or AI Hustle sessions.",
    "• Tap Contact for partners, press, or a direct email route.",
  ].join("\n");
}

function titleCase(word) {
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

function jsonResponse(body, status = 200) {
  return {
    status,
    headers: {
      "Content-Type": "application/json",
    },
    body,
  };
}

