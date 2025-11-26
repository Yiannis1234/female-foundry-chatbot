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

const DASHBOARD_CARD_META = {
  "What is the Female Innovation Index?": {
    icon: "📖",
    gradient: "linear-gradient(135deg, #7c63ff, #a977ff)",
    description: "Understand the scope, dataset, and purpose behind the Index.",
  },
  "I want to dive into the Index data": {
    icon: "📈",
    gradient: "linear-gradient(135deg, #5bc9ff, #4f79ff)",
    description: "Explore headline metrics, deep tech stats, and how to use the data.",
  },
  "I want to learn about the team": {
    icon: "👥",
    gradient: "linear-gradient(135deg, #ffa26b, #ff5a7a)",
    description: "Meet the people and collaborators behind the 2026 Index.",
  },
  "I want to learn about Methodology": {
    icon: "🧪",
    gradient: "linear-gradient(135deg, #7adca0, #3ab98f)",
    description: "See the research approach, data sources, and validation checks.",
  },
  "I want to learn about Female Foundry": {
    icon: "🏛️",
    gradient: "linear-gradient(135deg, #fbc93a, #ff8f5a)",
    description: "Get the elevator pitch, programs, and ways to engage with Female Foundry.",
  },
};

// --- Initialization ---
window.addEventListener("load", () => {
  // Ensure welcome view is visible on load
  if (views.welcome) {
    views.welcome.classList.remove("hidden");
    views.welcome.classList.add("active");
    // Hide other views
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
  // Use requestAnimationFrame to ensure DOM update before transition
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
      // IMPORTANT: Send name immediately to get the options for the dashboard
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
  // Note: data.options is initially empty until we send the name
}

async function sendNameToApi(name) {
  try {
    const res = await fetch(`${API_BASE}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId, message: name }),
    });
    const data = await res.json();
    
    // The response will contain the PRIMARY_OPTIONS because of the name state transition
    if (data.options && data.options.length > 0) {
      renderDashboard(data.options);
    }
    
    // Pre-populate chat with the welcome message so it's there when they click an option
    if (data.messages) {
      data.messages.forEach(msg => addMessage(msg.role, msg.content));
    }

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
  renderDashboard(data.options); // Resetting brings us back to dashboard state options
  switchView("dashboard");
}

// --- Dashboard Logic ---
function renderDashboard(options) {
  if (!dashboardOptions) {
    console.error("dashboardOptions element not found");
    return;
  }
  
  dashboardOptions.innerHTML = "";
  
  if (!options || options.length === 0) {
    console.warn("No options provided for dashboard");
    return;
  }
  
  // If backend sends specific strings, map them to icons/descriptions if possible
  // Or just render generic cards.
  options.forEach(opt => {
    const meta = DASHBOARD_CARD_META[opt] || {
      icon: "💡",
      gradient: "linear-gradient(135deg, #cfd8ff, #f7f6ff)",
      description: "Tap to explore this topic.",
    };
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div class="card-icon" style="background:${meta.gradient};">${meta.icon}</div>
      <div class="card-title">${opt}</div>
      <p class="card-desc">${meta.description}</p>
    `;
    card.onclick = () => handleDashboardSelection(opt);
    dashboardOptions.appendChild(card);
  });
}

async function restartExperience() {
  try {
    if (sessionId) {
      await fetch(`${API_BASE}/session/${sessionId}/reset`, {
        method: "POST",
      });
    }
  } catch (err) {
    console.error("Failed to reset session on restart", err);
  }
  clearChat();
  userName = "";
  sessionId = null;
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
    
    // Append bot responses
    if (data.messages) {
      data.messages.forEach(msg => addMessage(msg.role, msg.content));
    }
    
    // Update suggestions/options for next turn
    renderChatOptions(data.options);
    
  } catch (err) {
    console.error(err);
    hideTyping();
    addMessage("bot", "Sorry, something went wrong.");
  }
}

function addMessage(role, content) {
  if (!chatMessages) {
    console.error("chatMessages element not found");
    return;
  }
  
  const msgDiv = document.createElement("div");
  msgDiv.className = `chat-message ${role}`;
  
  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.textContent = role === "bot" ? "FF" : "You";
  
  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.innerHTML = content; // Allow HTML for links
  
  msgDiv.appendChild(avatar);
  msgDiv.appendChild(bubble);
  
  chatMessages.appendChild(msgDiv);
  scrollToBottom();
}

function renderChatOptions(options) {
  if (!chatOptions) {
    console.error("chatOptions element not found");
    return;
  }
  
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

  // Force scroll to show new options
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

// Scroll when window resizes (e.g. keyboard opens on mobile)
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
      resetSession();
    }
  });
}

if (restartFlowBtn) {
  restartFlowBtn.addEventListener("click", () => {
    restartExperience();
  });
}
