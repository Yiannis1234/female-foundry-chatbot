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
const backBtn = document.getElementById("back-to-dashboard");
const resetBtn = document.getElementById("reset-chat");
const restartFlowBtn = document.getElementById("restartFlow");

// UPDATED METADATA FOR NEW BOXES
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
  "About Female Foundry": "https://www.femaleinnovationindex.com/test?target=about",

  // Secondary (Chat buttons)
  "The Team": "https://www.femaleinnovationindex.com/test?target=team",
  "The Sponsors": "https://www.femaleinnovationindex.com/test?target=partners",
  "The Contributors": "https://www.femaleinnovationindex.com/test?target=team",
  "The Partners": "https://www.femaleinnovationindex.com/test?target=partners",
};

// --- Initialization ---
window.addEventListener("load", () => {
  setInitialView();
  attachWelcomeListeners();
  if (nameInput) nameInput.focus();
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
        window.open(OPTION_LINKS[opt], "_blank");
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
  switchView("chat");
  addMessage("user", text);
  await sendMessageToApi(text);
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
async function sendMessageToApi(text) {
  if (OPTION_LINKS[text]) {
    window.open(OPTION_LINKS[text], "_blank");
    return;
  }

  showTyping();
  try {
    const res = await fetch(`${API_BASE}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId, message: text }),
    });
    const data = await res.json();
    hideTyping();
    if (data.messages) {
      data.messages.forEach((msg) => addMessage(msg.role, msg.content));
    }
    renderChatOptions(data.options);
  } catch (err) {
    console.error(err);
    hideTyping();
    addMessage("bot", "Sorry, something went wrong.");
  }
}

function addMessage(role, content) {
  if (!chatMessages) return;

  const msgDiv = document.createElement("div");
  msgDiv.className = `chat-message ${role}`;

  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.textContent = role === "bot" ? "FF" : "You";

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.innerHTML = content;

  msgDiv.appendChild(avatar);
  msgDiv.appendChild(bubble);
  chatMessages.appendChild(msgDiv);
  scrollToBottom();
}

function renderChatOptions(options) {
  if (!chatOptions || !chatMessages) return;
  chatOptions.innerHTML = "";

  if (!options || options.length === 0) {
    chatOptions.style.display = "none";
    return;
  }

  chatOptions.style.display = "flex";

  options.forEach((opt) => {
    const chip = document.createElement("button");
    chip.className = "suggestion-chip";
    chip.textContent = opt;
    chip.onclick = () => {
      if (OPTION_LINKS[opt]) {
        window.open(OPTION_LINKS[opt], "_blank");
        return;
      }
      addMessage("user", opt);
      sendMessageToApi(opt);
    };
    chatOptions.appendChild(chip);
  });

  // Ensure chips stay visually below the latest messages
  chatMessages.appendChild(chatOptions);
  requestAnimationFrame(() => scrollToBottom());
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
  scrollToBottom();
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

window.addEventListener("resize", scrollToBottom);

// Chat Input Handlers
if (chatSendBtn) {
  chatSendBtn.addEventListener("click", () => {
    const val = chatInput ? chatInput.value.trim() : "";
    if (!val) return;
    addMessage("user", val);
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
      addMessage("user", val);
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
