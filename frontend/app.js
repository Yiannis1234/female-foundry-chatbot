const API_BASE = "/api";

// State
let sessionId = null;
let userName = "";
let currentView = "welcome"; // welcome, dashboard, chat

// DOM Elements
const views = {
  welcome: document.getElementById("view-welcome"),
  dashboard: document.getElementById("view-dashboard"),
  chat: document.getElementById("view-chat"),
};

const nameForm = document.getElementById("name-form");
const nameInput = document.getElementById("name-input");
const userNameDisplay = document.getElementById("user-name-display");

const dashboardOptions = document.getElementById("dashboard-options");
const dashboardSearch = document.getElementById("dashboard-search");
const dashboardSearchBtn = document.getElementById("dashboard-search-btn");

const chatMessages = document.getElementById("chatMessages");
const chatInput = document.getElementById("chatInput");
const chatSendBtn = document.getElementById("chatSend");
const chatOptions = document.getElementById("chatOptions");
const primaryFooterOptions = document.getElementById("primary-footer-options");
const backBtn = document.getElementById("back-to-dashboard");
const resetBtn = document.getElementById("reset-chat");
const restartFlowBtn = document.getElementById("restartFlow");

function openExternal(url) {
  // Ensure the chatbot stays on the current page: always open external navigation in a new tab/window.
  // Note: this is triggered directly from user clicks, so popup blockers shouldn't interfere.
  try {
    window.open(url, "_blank", "noopener,noreferrer");
  } catch (e) {
    window.open(url, "_blank");
  }
}

// UPDATED METADATA FOR NEW BOXES
const PRIMARY_LIST = [
  "The Era of Abundance",
  "Key Insights",
  "Idea",
  "Fundraising trends",
  "Behind the Index",
  "About Female Foundry",
];

const DASHBOARD_CARD_META = {
  "The Era of Abundance": {
    icon: "🌌",
    gradient: "linear-gradient(135deg, #7c63ff, #a977ff)",
    description:
      "Learn how AI is redefining how female founders build and solve the next generation of problems.",
    link: null,
  },
  "Key Insights": {
    icon: "💡",
    gradient: "linear-gradient(135deg, #5bc9ff, #4f79ff)",
    description:
      "Explore the key insights captured in the 2026 Edition of the Index and the methodology behind the data.",
    link: null,
  },
  Idea: {
    icon: "✨",
    gradient: "linear-gradient(135deg, #ffa26b, #ff5a7a)",
    description:
      "Explore where newly-minted female founders are emerging today—and what motivates them to start their companies.",
    link: null,
  },
  "Fundraising trends": {
    icon: "📈",
    gradient: "linear-gradient(135deg, #7adca0, #3ab98f)",
    description:
      "Dive into the fundraising data and see where capital is flowing for female-founded companies across Europe.",
    link: null,
  },
  "Behind the Index": {
    icon: "🤝",
    gradient: "linear-gradient(135deg, #fbc93a, #ff8f5a)",
    description:
      "See who is behind the Female Innovation Index—meet our team, the sponsors, the contributors, and the partners.",
    link: null,
  },
  "About Female Foundry": {
    icon: "🏛️",
    gradient: "linear-gradient(135deg, #cfd8ff, #9eaeff)",
    description:
      "Learn more about Female Foundry, the founding initiative that powers the Female Innovation Index every year.",
    link: null,
  },
};

// Direct links map (dashboard buttons and chat chips)
const OPTION_LINKS = {
  // Primary (Dashboard)
  "The Era of Abundance": "https://www.femaleinnovationindex.com/innovation",
  Idea: "https://www.femaleinnovationindex.com/idea?target=section100",
  "About Female Foundry": "https://www.femalefoundry.co/",

  // Secondary (Chat buttons)
  "The Team": "https://www.femaleinnovationindex.com/test?target=team",
  "The Sponsors": "https://www.femaleinnovationindex.com/test?target=partners",
  "The Contributors": "https://www.femaleinnovationindex.com/test?target=partners",
  "The Partners": "https://www.femaleinnovationindex.com/test?target=team",
};

// --- Initialization ---
console.log('[FF-CHATBOT] Version 60 loaded - mobile scroll fix');

// Store reference to the latest user message for scrolling
let latestUserMessage = null;

function scrollToShowOptions() {
  const chat = document.getElementById('chatMessages');
  if (!chat) return;
  
  // Find the last options bubble or prompt
  const optionsBubbles = chat.querySelectorAll('.options-bubble, .options-prompt');
  if (optionsBubbles.length > 0) {
    const lastOption = optionsBubbles[optionsBubbles.length - 1];
    
    // Method 1: scrollIntoView (works on desktop)
    try {
      lastOption.scrollIntoView({ behavior: 'instant', block: 'end' });
    } catch (e) {
      // Fallback for older browsers
      lastOption.scrollIntoView(false);
    }
    
    // Method 2: Direct scrollTop calculation (works better on mobile)
    setTimeout(() => {
      const optionRect = lastOption.getBoundingClientRect();
      const chatRect = chat.getBoundingClientRect();
      const scrollOffset = optionRect.bottom - chatRect.bottom + chat.scrollTop;
      
      // Scroll to show the option at the bottom of visible area
      chat.scrollTop = scrollOffset;
    }, 10);
    
    // Method 3: Scroll to bottom minus option height (mobile fallback)
    setTimeout(() => {
      const optionHeight = lastOption.offsetHeight;
      chat.scrollTop = chat.scrollHeight - chat.clientHeight - optionHeight;
    }, 50);
    
  } else if (latestUserMessage) {
    // Fallback: scroll user message to top
    try {
      latestUserMessage.scrollIntoView({ behavior: 'instant', block: 'start' });
    } catch (e) {
      latestUserMessage.scrollIntoView(true);
    }
  }
}

function forceScrollToTop() {
  // Scroll to show options
  scrollToShowOptions();
  
  // Keep trying for 1.5 seconds (longer for mobile)
  const times = [10, 30, 50, 100, 150, 200, 300, 500, 750, 1000, 1500];
  times.forEach(t => {
    setTimeout(scrollToShowOptions, t);
  });
  
  notifyParentPreventScroll();
}


// Notify parent iframe (if in Wix) to prevent scroll
function notifyParentPreventScroll() {
  if (window.parent && window.parent !== window) {
    try {
      window.parent.postMessage({ type: 'prevent-scroll' }, '*');
    } catch(e) {
      // Cross-origin restriction - ignore
    }
  }
}

// MutationObserver to prevent auto-scroll when content is added
// No MutationObserver needed - we scroll to top explicitly after adding content

window.addEventListener("load", () => {
  setInitialView();
  attachWelcomeListeners();
  if (nameInput) nameInput.focus();

  // Intercept any <a href="..."> clicks inside chat bubbles and always open in a new tab,
  // so the chatbot page never navigates away (even if the link is "external").
  if (chatMessages) {
    chatMessages.addEventListener("click", (e) => {
      const target = e.target;
      if (!target || !(target instanceof Element)) return;
      const anchor = target.closest("a[href]");
      if (!anchor) return;

      const href = anchor.getAttribute("href") || "";
      // Only intercept http(s) links. Let mailto/tel behave normally.
      if (/^https?:\/\//i.test(href)) {
        e.preventDefault();
        e.stopPropagation();
        openExternal(href);
      }
    });
  }
});

function setInitialView() {
  if (views.welcome) {
    views.welcome.classList.remove("hidden");
    views.welcome.classList.add("active");
  }
  if (views.dashboard) {
    views.dashboard.classList.add("hidden");
    views.dashboard.classList.remove("active");
  }
  if (views.chat) {
    views.chat.classList.add("hidden");
    views.chat.classList.remove("active");
  }
}

// --- View Management ---
function switchView(viewName) {
  if (!views[viewName]) {
    console.error(`View ${viewName} not found`);
    return;
  }

  Object.values(views).forEach((el) => {
    if (el) {
      el.classList.remove("active");
      el.classList.add("hidden");
    }
  });

  const target = views[viewName];
  target.classList.remove("hidden");
  requestAnimationFrame(() => {
    target.classList.add("active");
  });

  currentView = viewName;

  // When switching to chat view, scroll to top
  if (viewName === "chat") {
    forceScrollToTop();
  }
}

// --- Welcome Flow ---
function attachWelcomeListeners() {
  if (nameForm) {
    nameForm.addEventListener("submit", (e) => {
      e.preventDefault();
      submitName();
    });
  }

  if (nameInput) {
    nameInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        submitName();
      }
    });
  }
}

async function submitName() {
  const name = nameInput ? nameInput.value.trim() : "";
  if (!name) return;

  userName = name;
  if (userNameDisplay) userNameDisplay.textContent = name;

  try {
    await startSession();
    await sendNameToApi(name);
    switchView("dashboard");
  } catch (err) {
    console.error("Failed to start session", err);
    alert("Could not connect to server. Please try again.");
  }
}

// --- Session Logic ---
async function startSession() {
  const res = await fetch(`${API_BASE}/session`, { method: "POST" });
  if (!res.ok) throw new Error("Network error");
  const data = await res.json();
  sessionId = data.session_id;
}

async function sendNameToApi(name) {
  try {
    const res = await fetch(`${API_BASE}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId, message: name }),
    });
    const data = await res.json();
    if (data.options && data.options.length > 0) {
      renderDashboard(data.options);
    }
  } catch (err) {
    console.error("Error sending name:", err);
  }
}

async function resetSession() {
  if (!sessionId) return;
  const res = await fetch(`${API_BASE}/session/${sessionId}/reset`, { method: "POST" });
  const data = await res.json();
  clearChat();
  renderDashboard(data.options);
  switchView("dashboard");
}

// --- Dashboard Logic ---
function renderDashboard(options) {
  if (!dashboardOptions) return;

  dashboardOptions.innerHTML = "";
  if (!options || options.length === 0) return;

  // Always show the primary 6 in footer on dashboard
  renderPrimaryFooterOptions(PRIMARY_LIST);

  options.forEach((opt) => {
    const meta =
      DASHBOARD_CARD_META[opt] || {
        icon: "💡",
        gradient: "linear-gradient(135deg, #cfd8ff, #f7f6ff)",
        description: "Tap to explore this topic.",
        link: null,
      };

    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div class="card-icon" style="background:${meta.gradient};">${meta.icon}</div>
      <div class="card-title">${opt}</div>
      <p class="card-desc">${meta.description}</p>
    `;

    card.onclick = () => {
      if (OPTION_LINKS[opt]) {
        openExternal(OPTION_LINKS[opt]);
        return;
      }
      handleDashboardSelection(opt);
    };

    dashboardOptions.appendChild(card);
  });
}

async function restartExperience() {
  sessionId = null;
  userName = "";
  clearChat();
  if (nameInput) nameInput.value = "";
  if (userNameDisplay) userNameDisplay.textContent = "there";
  switchView("welcome");
  if (nameInput) nameInput.focus();
}

async function handleDashboardSelection(text) {
  forceScrollToTop();
  switchView("chat");
  addMessage("user", text, false);
  await sendMessageToApi(text, { pinTop: true });
  forceScrollToTop();
}

if (dashboardSearchBtn) {
  dashboardSearchBtn.addEventListener("click", () => {
    const val = dashboardSearch ? dashboardSearch.value.trim() : "";
    if (val) handleDashboardSelection(val);
  });
}

if (dashboardSearch) {
  dashboardSearch.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const val = dashboardSearch.value.trim();
      if (val) handleDashboardSelection(val);
    }
  });
}

// --- Chat Logic ---
async function sendMessageToApi(text, { pinTop = false } = {}) {
  console.log('[DEBUG] sendMessageToApi called with:', text, 'sessionId:', sessionId);
  
  if (OPTION_LINKS[text]) {
    console.log('[DEBUG] Opening external link for:', text);
    openExternal(OPTION_LINKS[text]);
    return;
  }

  if (!sessionId) {
    console.error('[DEBUG] No sessionId! Cannot send message.');
    addMessage("bot", "Session not started. Please refresh and try again.", false);
    return;
  }

  showTyping();
  try {
    console.log('[DEBUG] Fetching API...');
    const res = await fetch(`${API_BASE}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId, message: text }),
    });
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const data = await res.json();
    console.log('[DEBUG] API response:', data);
    hideTyping();

    if (pinTop) {
      forceScrollToTop();
      notifyParentPreventScroll();
    }
    
    if (data.messages && data.messages.length > 0) {
      console.log('[DEBUG] Adding', data.messages.length, 'messages');
      data.messages.forEach((msg) => addMessage(msg.role, msg.content, false));
    } else {
      console.log('[DEBUG] No messages in response');
    }

    renderChatOptions(data.options);

    if (pinTop) {
      forceScrollToTop();
    }
  } catch (err) {
    console.error('[DEBUG] API error:', err);
    hideTyping();
    addMessage("bot", "Sorry, something went wrong. Error: " + err.message, false);
    if (pinTop) forceScrollToTop();
  }
}

function addMessage(role, content, shouldScroll = false) {
  console.log('[DEBUG] addMessage called:', role, content?.substring(0, 50));
  
  if (!chatMessages) {
    console.error('[DEBUG] chatMessages element not found!');
    return;
  }

  const segments =
    role === "bot" ? splitBotContent(content) : [content];

  console.log('[DEBUG] Adding', segments.length, 'message segments');

  let firstMsgDiv = null;
  
  segments.forEach((segment, index) => {
    const msgDiv = document.createElement("div");
    msgDiv.className = `chat-message ${role}`;

    const avatar = document.createElement("div");
    avatar.className = "avatar";
    avatar.textContent = role === "bot" ? "FF" : "You";

    const bubble = document.createElement("div");
    bubble.className = "bubble";
    bubble.innerHTML = segment;

    msgDiv.appendChild(avatar);
    msgDiv.appendChild(bubble);
    chatMessages.appendChild(msgDiv);
    console.log('[DEBUG] Message appended to chatMessages');
    
    // Store reference to first message of this batch
    if (index === 0) {
      firstMsgDiv = msgDiv;
    }
  });
  
  // If this is a user message, store it for scroll targeting
  if (role === "user" && firstMsgDiv) {
    latestUserMessage = firstMsgDiv;
  }

  // Only scroll to bottom if explicitly requested (user typing)
  if (shouldScroll) {
    requestAnimationFrame(() => {
      if (chatMessages) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }
    });
  }
}

function splitBotContent(content) {
  // If the content contains structured HTML (lists/links), avoid splitting to prevent broken markup.
  if (content.includes("<ul") || content.includes("<ol") || content.includes("<a")) {
    return [content];
  }

  // 1) Respect explicit breaks first
  if (content.includes("<br")) {
    return content.split(/<br\s*\/?>\s*/).filter(Boolean);
  }

  // 2) Split by sentences if long enough
  const sentenceParts = content
    .split(/(?<=[.!?])\s+/)
    .map((p) => p.trim())
    .filter(Boolean);

  if (sentenceParts.length > 1 && content.length > 120) {
    return sentenceParts;
  }

  // 3) Fallback: chunk every ~140 chars
  if (content.length > 160) {
    const chunks = [];
    let start = 0;
    const size = 140;
    while (start < content.length) {
      chunks.push(content.slice(start, start + size));
      start += size;
    }
    return chunks;
  }

  return [content];
}

function renderChatOptions(options) {
  if (!chatMessages) return;

  // Footer should always show the primary 6
  renderPrimaryFooterOptions(PRIMARY_LIST);

  // Remove any previous option bubbles/prompts
  const oldOptionBubbles = chatMessages.querySelectorAll(".options-bubble, .options-prompt");
  oldOptionBubbles.forEach((el) => el.remove());

  if (!options || options.length === 0) {
    return;
  }

  // If these are the primary 6, show them in the footer and skip inline bubble
  if (isPrimaryOptions(options)) {
    return;
  }

  // Add a prompt bubble before secondary options
  const promptDiv = document.createElement("div");
  promptDiv.className = "chat-message bot options-prompt";
  const promptAvatar = document.createElement("div");
  promptAvatar.className = "avatar";
  promptAvatar.textContent = "FF";
  const promptBubble = document.createElement("div");
  promptBubble.className = "bubble";
  promptBubble.innerHTML = "What would you like to explore?";
  promptDiv.appendChild(promptAvatar);
  promptDiv.appendChild(promptBubble);
  chatMessages.appendChild(promptDiv);

  // Each option as its own bubble (separate clouds)
  options.forEach((opt) => {
    const msgDiv = document.createElement("div");
    msgDiv.className = "chat-message bot options-bubble option-chip-bubble";

    const avatar = document.createElement("div");
    avatar.className = "avatar";
    avatar.textContent = "FF";

    const bubble = document.createElement("div");
    bubble.className = "bubble bubble-options";

    const chip = document.createElement("button");
    chip.className = "suggestion-chip";
    chip.textContent = `💬 ${opt}`;
    chip.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      if (OPTION_LINKS[opt]) {
        openExternal(OPTION_LINKS[opt]);
        return;
      }
      
      forceScrollToTop();
      notifyParentPreventScroll();
      addMessage("user", opt, false);
      sendMessageToApi(opt, { pinTop: true });
    };

    bubble.appendChild(chip);
    msgDiv.appendChild(avatar);
    msgDiv.appendChild(bubble);
    chatMessages.appendChild(msgDiv);
  });

  // Scroll to top after adding options
  forceScrollToTop();
}

function renderPrimaryFooterOptions(options) {
  if (!primaryFooterOptions) return;
  primaryFooterOptions.innerHTML = "";

  if (!options || options.length === 0) {
    primaryFooterOptions.style.display = "none";
    return;
  }

  primaryFooterOptions.style.display = "flex";

  options.forEach((opt) => {
    const btn = document.createElement("button");
    btn.className = "footer-chip";
    btn.textContent = `💬 ${opt}`;
    btn.onclick = () => {
      console.log('[DEBUG] Footer button clicked:', opt);
      
      // Clear any pending prompts/bubbles when switching primary via footer
      if (chatMessages) {
        const oldOptionBubbles = chatMessages.querySelectorAll(".options-bubble, .options-prompt");
        oldOptionBubbles.forEach((el) => el.remove());
      }
      if (OPTION_LINKS[opt]) {
        console.log('[DEBUG] Opening external link');
        openExternal(OPTION_LINKS[opt]);
        return;
      }
      
      forceScrollToTop();
      notifyParentPreventScroll();
      addMessage("user", opt, false);
      sendMessageToApi(opt, { pinTop: true });
    };
    primaryFooterOptions.appendChild(btn);
  });
}

function isPrimaryOptions(opts) {
  const primarySet = new Set([
    "The Era of Abundance",
    "Key Insights",
    "Idea",
    "Fundraising trends",
    "Behind the Index",
    "About Female Foundry",
  ]);
  if (!Array.isArray(opts) || opts.length !== 6) return false;
  return opts.every((o) => primarySet.has(o));
}

function isKeyInsightsSecondary(opts) {
  if (!Array.isArray(opts) || opts.length !== 2) return false;
  const set = new Set(opts);
  return set.has("Methodology") && set.has("Key Insights");
}

let typingIndicator = null;
function showTyping() {
  if (!chatMessages || typingIndicator) return;
  const wrapper = document.createElement("div");
  wrapper.className = "chat-message bot";
  wrapper.innerHTML = `
    <div class="avatar">FF</div>
    <div class="bubble" style="font-style:italic; color:#888;">Typing...</div>
  `;
  typingIndicator = wrapper;
  chatMessages.appendChild(wrapper);
  // Don't auto-scroll - let user see the start
  // scrollToBottom();
}

function hideTyping() {
  if (typingIndicator) {
    typingIndicator.remove();
    typingIndicator = null;
  }
}

function clearChat() {
  if (chatMessages) chatMessages.innerHTML = "";
  if (chatOptions) chatOptions.innerHTML = "";
}

function scrollToBottom() {
  if (chatMessages) {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
}

function scrollToTop() {
  if (chatMessages) {
    chatMessages.scrollTop = 0;
  }
}

// Removed auto-scroll on resize - let user control scrolling
// window.addEventListener("resize", scrollToBottom);

// Chat Input Handlers
if (chatSendBtn) {
  chatSendBtn.addEventListener("click", () => {
    const val = chatInput ? chatInput.value.trim() : "";
    if (!val) return;
    addMessage("user", val, true); // Scroll when user types
    if (chatInput) chatInput.value = "";
    sendMessageToApi(val);
  });
}

if (chatInput) {
  chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const val = chatInput.value.trim();
      if (!val) return;
      addMessage("user", val, true); // Scroll when user types
      chatInput.value = "";
      sendMessageToApi(val);
    }
  });
}

// Navigation Handlers
if (backBtn) {
  backBtn.addEventListener("click", () => switchView("dashboard"));
}

if (resetBtn) {
  resetBtn.addEventListener("click", () => {
    if (confirm("Start a new session?")) {
      restartExperience();
    }
  });
}

if (restartFlowBtn) {
  restartFlowBtn.addEventListener("click", () => restartExperience());
}
