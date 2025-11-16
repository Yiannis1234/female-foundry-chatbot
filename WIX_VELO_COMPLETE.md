# Complete Wix Velo Chatbot Integration (No External Hosting)

This guide will help you build the chatbot entirely within Wix Velo - no external hosting needed!

---

## 📋 Setup Steps

### Step 1: Create Wix Data Collection (for FAQ data)

1. **In Wix Editor:**
   - Click **"Add"** → **"Database"** → **"New Collection"**
   - Name it: `ChatbotFAQs`
   - Click **"Create Collection"**

2. **Add Fields:**
   - Click **"Add Field"** and create these fields:
     - `id` (Text, Required)
     - `title` (Text, Required)
     - `question` (Text, Required)
     - `answer` (Rich Text, Required)
     - `tags` (Text, Multiple values)
     - `altQuestions` (Text, Multiple values) - Optional

3. **Import Data:**
   - Click **"Import"** → **"Import from CSV"**
   - Use the CSV file I'll provide below, OR manually add entries

### Step 2: Create HTTP Functions (Backend API)

1. **In Velo Dev Mode:**
   - Click the curly braces `{}` icon
   - Click **"Backend & Public"** in the left sidebar
   - Click **"HTTP Functions"** → **"+ New"**

2. **Create 3 HTTP Functions:**

#### Function 1: `createSession.js`
```javascript
import wixData from 'wix-data';

export async function post_createSession(request) {
  const sessionId = generateSessionId();
  
  return {
    status: 200,
    headers: { "Content-Type": "application/json" },
    body: {
      session_id: sessionId,
      stage: "ask_name",
      messages: [
        {
          role: "bot",
          content: "Hi! I'm the Female Foundry assistant. What's your name?"
        }
      ],
      options: []
    }
  };
}

function generateSessionId() {
  return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}
```

#### Function 2: `chat.js`
```javascript
import wixData from 'wix-data';

const PRIMARY_OPTIONS = [
  "VC & Funding Insights",
  "Female Foundry Programs",
  "Community & Stories",
  "Contact & Partners",
];

const SECONDARY_OPTIONS = {
  "VC & Funding Insights": ["Headline metrics", "Deep Tech & AI", "Using the Index"],
  "Female Foundry Programs": ["AI Visionaries", "AI Hustle", "Sunday Newsletter"],
  "Community & Stories": ["Join the community", "Campaigns", "Shop"],
  "Contact & Partners": ["Contact", "Partners", "Media coverage"],
};

const PRIMARY_KEYWORDS = {
  "funding": "VC & Funding Insights",
  "vc": "VC & Funding Insights",
  "investment": "VC & Funding Insights",
  "program": "Female Foundry Programs",
  "incubator": "Female Foundry Programs",
  "ai hustle": "Female Foundry Programs",
  "visionaries": "Female Foundry Programs",
  "community": "Community & Stories",
  "stories": "Community & Stories",
  "shop": "Community & Stories",
  "contact": "Contact & Partners",
  "partner": "Contact & Partners",
  "press": "Contact & Partners",
};

const SECONDARY_KEYWORDS = {
  "headline": "Headline metrics",
  "stat": "Headline metrics",
  "metrics": "Headline metrics",
  "deep tech": "Deep Tech & AI",
  "ai": "Deep Tech & AI",
  "index": "Using the Index",
  "ai visionaries": "AI Visionaries",
  "visionaries": "AI Visionaries",
  "ai hustle": "AI Hustle",
  "hustle": "AI Hustle",
  "newsletter": "Sunday Newsletter",
  "join the community": "Join the community",
  "community": "Join the community",
  "campaign": "Campaigns",
  "shop": "Shop",
  "contact": "Contact",
  "email": "Contact",
  "partner": "Partners",
  "media": "Media coverage",
};

const INFO_MAP = {
  "Headline metrics": "• €5.76B raised by female-founded startups in Europe during 2024 (1,305 deals across 1,196 companies).\n• Represents roughly 12% of all European VC; deep tech attracts about one-third of that capital.\n• The Female Innovation Index aggregates 1,200+ survey responses and tracks 145k+ companies.",
  "Deep Tech & AI": "• Deep tech companies capture roughly one-third of the capital raised by female-founded startups.\n• Data & AI founders cite funding (67 mentions) and slow adoption (47) as top bottlenecks.\n• Health & life-science founders echo funding, adoption, and economic uncertainty challenges—filter Dealroom tags for precise counts.",
  "Using the Index": "• Use Dealroom exports DR_FF_C_1 (female-founded VC) and DR_MC_C_5 (monthly capital) for charts.\n• Funnel views reveal drop-off points across awareness, acceleration, and funding.\n• Start from the 2025 Index landing page for methodology and download links.",
  "AI Visionaries": "• Female Foundry's AI incubator with Google Cloud for frontier AI founders.\n• 'Visit AI Visionaries' shows cohorts, mentors, curriculum, and application windows.\n• Offers tailored GTM support, mentor office hours, and showcase opportunities.",
  "AI Hustle": "• Free monthly 1-hour clinic with Agata Nowicka (up to three founders).\n• Tap the homepage 'Sign Up' CTA to request a slot.\n• Ideal for quick GTM troubleshooting, warm intros, and accountability.",
  "Sunday Newsletter": "• Weekly roundup covering funding news, founder tactics, and ecosystem signals.\n• Use the homepage 'Read' button to browse the latest edition or subscribe.\n• Designed for female founders, operators, and allies tracking European venture.",
  "Join the community": "• 7,000+ founders, investors, and operators in the Female Foundry network.\n• Click 'Join the Community' on the homepage to submit your membership form.\n• Welcome call scheduled within five business days.",
  "Campaigns": "• Watch founder stories and community highlights via the homepage 'Watch' CTA.\n• Celebrates female founders building across Europe.\n• Shareable content for social media and events.",
  "Shop": "• Access the Female Foundry Shop from the footer.\n• Merchandise and resources for community members.\n• Proceeds support Female Foundry initiatives.",
  "Contact": "• Email: HELLO@FEMALEFOUNDRY.CO\n• Address: 11 Welbeck Street, W1G 9XZ, London\n• Footer links to About, Partners, Careers, and privacy policy.",
  "Partners": "• View partner logos on the homepage header.\n• Includes Carta, Accenture, London Stock Exchange, Cooley, Google Cloud, HSBC Innovation Banking.\n• Footer links to partner pages.",
  "Media coverage": "• Press inquiries: HELLO@FEMALEFOUNDRY.CO\n• Female Innovation Index reports available for download.\n• Media kit and founder stories accessible via footer.",
};

// In-memory session storage (for demo - use Wix Data in production)
const sessions = {};

export async function post_chat(request) {
  const { session_id, message } = request.body;
  
  if (!sessions[session_id]) {
    sessions[session_id] = {
      stage: "ask_name",
      visitor_name: null,
      primary_choice: null,
      history: []
    };
  }
  
  const state = sessions[session_id];
  const trimmed = message.trim().toLowerCase();
  
  let response = handleMessage(state, trimmed);
  
  return {
    status: 200,
    headers: { "Content-Type": "application/json" },
    body: response
  };
}

function handleMessage(state, trimmed) {
  if (state.stage === "ask_name") {
    state.visitor_name = trimmed;
    state.stage = "menu_primary";
    return {
      messages: [
        {
          role: "bot",
          content: formatBotMessage(`Nice to meet you, ${state.visitor_name}! Choose what you'd like to explore:`)
        }
      ],
      options: PRIMARY_OPTIONS,
      stage: state.stage
    };
  }
  
  // Keyword matching for primary options
  let matchedPrimary = null;
  for (const [keyword, option] of Object.entries(PRIMARY_KEYWORDS)) {
    if (trimmed.includes(keyword)) {
      matchedPrimary = option;
      break;
    }
  }
  
  if (matchedPrimary) {
    state.primary_choice = matchedPrimary;
    state.stage = "menu_secondary";
    const followUps = SECONDARY_OPTIONS[matchedPrimary] || [];
    return {
      messages: [
        {
          role: "bot",
          content: formatBotMessage(`Great! Let's drill into ${matchedPrimary}. Pick a specific topic:`)
        }
      ],
      options: followUps,
      stage: state.stage
    };
  }
  
  // Keyword matching for secondary options
  let matchedSecondary = null;
  for (const [keyword, option] of Object.entries(SECONDARY_KEYWORDS)) {
    if (trimmed.includes(keyword)) {
      matchedSecondary = option;
      break;
    }
  }
  
  if (matchedSecondary) {
    const bullets = INFO_MAP[matchedSecondary] || "I don't have that snippet yet—try another option.";
    state.stage = "menu_primary";
    state.primary_choice = null;
    return {
      messages: [
        {
          role: "bot",
          content: formatBotMessage(bullets)
        },
        {
          role: "bot",
          content: formatBotMessage("Anything else you'd like to explore?")
        }
      ],
      options: PRIMARY_OPTIONS,
      stage: state.stage
    };
  }
  
  // Check if it's a primary option click
  if (PRIMARY_OPTIONS.includes(trimmed)) {
    state.primary_choice = trimmed;
    state.stage = "menu_secondary";
    const followUps = SECONDARY_OPTIONS[trimmed] || [];
    return {
      messages: [
        {
          role: "bot",
          content: formatBotMessage(`Great! Let's drill into ${trimmed}. Pick a specific topic:`)
        }
      ],
      options: followUps,
      stage: state.stage
    };
  }
  
  // Check if it's a secondary option click
  if (Object.values(SECONDARY_OPTIONS).flat().includes(trimmed)) {
    const bullets = INFO_MAP[trimmed] || "I don't have that snippet yet—try another option.";
    state.stage = "menu_primary";
    state.primary_choice = null;
    return {
      messages: [
        {
          role: "bot",
          content: formatBotMessage(bullets)
        },
        {
          role: "bot",
          content: formatBotMessage("Anything else you'd like to explore?")
        }
      ],
      options: PRIMARY_OPTIONS,
      stage: state.stage
    };
  }
  
  // Fallback
  return {
    messages: [
      {
        role: "bot",
        content: formatBotMessage("I'm not sure I understand. Try selecting one of the options above, or ask about funding, programs, or the community!")
      }
    ],
    options: state.stage === "menu_primary" ? PRIMARY_OPTIONS : (SECONDARY_OPTIONS[state.primary_choice] || []),
    stage: state.stage
  };
}

function formatBotMessage(text) {
  const lines = text.split('\n').filter(l => l.trim());
  return lines.map(line => {
    if (line.startsWith('•')) {
      return line;
    }
    return line;
  }).join('\n');
}
```

#### Function 3: `resetSession.js`
```javascript
// In-memory session storage (same as chat.js)
const sessions = {};

export async function post_resetSession(request) {
  const sessionId = request.path[0]; // e.g., /resetSession/session_123
  
  if (sessions[sessionId]) {
    sessions[sessionId] = {
      stage: "ask_name",
      visitor_name: null,
      primary_choice: null,
      history: []
    };
  }
  
  return {
    status: 200,
    headers: { "Content-Type": "application/json" },
    body: {
      session_id: sessionId,
      stage: "ask_name",
      messages: [
        {
          role: "bot",
          content: "Hi! I'm the Female Foundry assistant. What's your name?"
        }
      ],
      options: []
    }
  };
}
```

### Step 3: Add Frontend Code to Your Page

Replace your page code with the complete code in the next file I'll create.

---

## 🎯 Next: Complete Page Code

See the next file for the complete frontend code that embeds everything in Wix.

