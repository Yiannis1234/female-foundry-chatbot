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
    icon: "🌌", // Example icon
    gradient: "linear-gradient(135deg, #7c63ff, #a977ff)",
    description: "Learn how AI is redefining how female founders build and solve the next generation of problems.",
    link: null // We will handle this via chat response now
  },
  "Key Insights": {
    icon: "💡",
    gradient: "linear-gradient(135deg, #5bc9ff, #4f79ff)",
    description: "Explore the key insights captured in the 2026 Edition of the Index and the methodology behind the data.",
    link: null // Chat flow
  },
  "Idea": {
    icon: "✨",
    gradient: "linear-gradient(135deg, #ffa26b, #ff5a7a)",
    description: "Explore where newly-minted female founders are emerging today—and what motivates them to start their companies.",
    link: null // We will handle this via chat response now
  },
  "Fundraising trends": {
    icon: "📈",
    gradient: "linear-gradient(135deg, #7adca0, #3ab98f)",
    description: "Dive into the fundraising data and see where capital is flowing for female-founded companies across Europe.",
    link: null // Chat flow
  },
  "Behind the Index": {
    icon: "🤝",
    gradient: "linear-gradient(135deg, #fbc93a, #ff8f5a)",
    description: "See who is behind the Female Innovation Index—meet our team, the sponsors, the contributors, and the partners.",
    link: null // Chat flow
  },
  "About Female Foundry": {
    icon: "🏛️",
    gradient: "linear-gradient(135deg, #cfd8ff, #9eaeff)",
    description: "Learn more about Female Foundry, the founding initiative that powers the Female Innovation Index every year.",
    link: null // We will handle this via chat response now
  },
};

// --- Initialization ---
window.addEventListener("load", () => {
  if (views.welcome) {
    views.welcome.classList.remove("hidden");
    views.welcome.classList.add("active");
    if (views.dashboard) {
      views.dashboard.classList.add("hidden");
      views.dashboard.classList.remove("active");
    }
    if (views.chat) {
      views.chat.classList.add("hidden");
      views.chat.classList.remove("active");
    }
  }
  if (nameInput) nameInput.focus();
});

// --- View Management ---
function switchView(viewName) {
  if (!views[viewName]) {
    console.error(`View ${viewName} not found`);
    return;
  }

  // Hide all views first
  Object.values(views).forEach((el) => {
    if (el) {
      el.classList.remove("active");
      el.classList.add("hidden");
    }
  });

  // Show target view
  const target = views[viewName];
  target.classList.remove("hidden");
  requestAnimationFrame(() => {
    target.classList.add("active");
  });

  currentView = viewName;
}

// --- Welcome Flow ---
if (nameForm) {
  nameForm.addEventListener("submit", async (e) => {
    e.preventDefault();
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
  });
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
    
    // The response contains the PRIMARY_OPTIONS
    if (data.options && data.options.length > 0) {
      renderDashboard(data.options);
    }
    
    // We do NOT populate chat messages here because the user is going to the Dashboard first.
    // But if we wanted to show a history later, we could.

  } catch (err) {
    console.error("Error sending name:", err);
  }
}

async function resetSession() {
  if (!sessionId) return;
  const res = await fetch(`${API_BASE}/session/${sessionId}/reset`, {
    method: "POST",
  });
  const data = await res.json();
  clearChat();
  
  // If resetting to start, we might want to go back to Name input? 
  // Or just clear chat and go to dashboard. 
  // Requirement says "Restart" flow.
  renderDashboard(data.options); 
  switchView("dashboard");
}

// --- Dashboard Logic ---
function renderDashboard(options) {
  if (!dashboardOptions) return;
  
  dashboardOptions.innerHTML = "";
  
  if (!options || options.length === 0) {
    console.warn("No options provided for dashboard");
    return;
  }
  
  options.forEach(opt => {
    // Match metadata either by exact key or fallback
    const meta = DASHBOARD_CARD_META[opt] || {
      icon: "💡",
      gradient: "linear-gradient(135deg, #cfd8ff, #f7f6ff)",
      description: "Tap to explore this topic.",
      link: null
    };
    
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div class="card-icon" style="background:${meta.gradient};">${meta.icon}</div>
      <div class="card-title">${opt}</div>
      <p class="card-desc">${meta.description}</p>
    `;
    
    // Handle click: ALWAYS Chat Flow now
    card.onclick = () => {
        handleDashboardSelection(opt);
    };
    
    dashboardOptions.appendChild(card);
  });
}

async function restartExperience() {
  // Full restart: New Session, Back to Welcome Screen
  try {
    if (sessionId) {
       // Optional: notify backend we are quitting
    }
  } catch (err) { console.error(err); }
  
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
  // Simulate sending this as a message
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
      data.messages.forEach(msg => addMessage(msg.role, msg.content));
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
  if (!chatOptions) return;
  
  chatOptions.innerHTML = "";
  if (!options || options.length === 0) return;
  
  options.forEach(opt => {
    const chip = document.createElement("button");
    chip.className = "suggestion-chip";
    chip.textContent = opt;
    chip.onclick = () => {
      addMessage("user", opt);
      sendMessageToApi(opt);
    };
    chatOptions.appendChild(chip);
  });

  requestAnimationFrame(() => {
    scrollToBottom();
  });
}

let typingIndicator = null;
function showTyping() {
  if (!chatMessages) return;
  if (typingIndicator) return;
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
  backBtn.addEventListener("click", () => {
    switchView("dashboard");
  });
}

if (resetBtn) {
  resetBtn.addEventListener("click", () => {
    if (confirm("Start a new session?")) {
      restartExperience(); // Prefer restart over reset for "Start Over"
    }
  });
}

if (restartFlowBtn) {
  restartFlowBtn.addEventListener("click", () => {
    restartExperience();
  });
}
