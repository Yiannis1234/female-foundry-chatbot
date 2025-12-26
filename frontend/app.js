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

// Fallback method if JS navigation is ever needed
function openExternal(url) {
  console.log('[FF-CHATBOT] Attempting JS top navigation to:', url);
  try {
    window.top.location.href = url;
  } catch (e) {
    console.log('[FF-CHATBOT] top.location blocked, trying regular open', e);
    window.open(url, '_top');
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
  "Methodology": "https://www.femaleinnovationindex.com/methodology",
  "Key Findings": "https://www.femaleinnovationindex.com/innovation",
  "The Team": "https://www.femaleinnovationindex.com/test?target=team",
  "The Sponsors": "https://www.femaleinnovationindex.com/test?target=partners",
  "The Contributors": "https://www.femaleinnovationindex.com/test?target=partners",
  "The Partners": "https://www.femaleinnovationindex.com/test?target=team",
};

// --- Session Management ---
let localHistory = []; // Local cache of chat history

// IMPORTANT: Use sessionStorage (per-tab/per-device) so progress is NOT shared across devices.
// Some browsers can sync localStorage via account sync; sessionStorage does not.
const FF_PERSIST = (() => {
  try {
    const k = "__ff_persist_test__";
    window.sessionStorage.setItem(k, "1");
    window.sessionStorage.removeItem(k);
    return window.sessionStorage;
  } catch (e) {
    return null;
  }
})();

function ffGet(key) {
  try {
    return FF_PERSIST ? FF_PERSIST.getItem(key) : null;
  } catch (e) {
    return null;
  }
}

function ffSet(key, value) {
  try {
    if (FF_PERSIST) FF_PERSIST.setItem(key, value);
  } catch (e) {
    // ignore
  }
}

function ffRemove(key) {
  try {
    if (FF_PERSIST) FF_PERSIST.removeItem(key);
  } catch (e) {
    // ignore
  }
}

function ffClearPersistedSession() {
  ["ff_session_id", "ff_user_name", "ff_chat_history", "ff_last_options", "ff_last_view"].forEach((k) => {
    ffRemove(k);
    // Also clear legacy localStorage so it doesn't sync across devices
    try { localStorage.removeItem(k); } catch (e) {}
  });
}

async function restoreSession() {
  try {
    // Clear legacy localStorage keys (pre-v97) so progress doesn't sync across devices.
    try {
      ["ff_session_id", "ff_user_name", "ff_chat_history", "ff_last_options", "ff_last_view"].forEach((k) =>
        localStorage.removeItem(k)
      );
    } catch (e) {}

    const savedId = ffGet("ff_session_id");
    const savedName = ffGet("ff_user_name");
    const savedHistory = JSON.parse(ffGet("ff_chat_history") || "[]");
    const savedLastOptions = JSON.parse(ffGet("ff_last_options") || "[]");
    const savedLastView = ffGet("ff_last_view") || "";
    
    if (savedId && savedName) {
      console.log('[FF-CHATBOT] Found saved session:', savedId);
      
      // Verify session with server
      const res = await fetch(`${API_BASE}/session/${savedId}`);
      if (res.ok) {
        const state = await res.json();
        sessionId = savedId;
        userName = (state && state.visitor_name) ? state.visitor_name : savedName;
        if (userNameDisplay) userNameDisplay.textContent = userName;
        
        console.log('[FF-CHATBOT] Session restored successfully');
        
        // If server session is still in ask_name, prime it with the saved name.
        if (state && state.stage === "ask_name") {
          try {
            await sendNameToApi(userName);
          } catch (e) {}
        }

        // Restore history: Prefer server history, fallback to local
        const historyToReplay = (state.history && state.history.length > 0) ? state.history : savedHistory;
        
        if (historyToReplay && historyToReplay.length > 0) {
          localHistory = historyToReplay; // Sync local
          saveSession(sessionId, userName); // Resave to be sure
          
          switchView('chat');
          chatMessages.innerHTML = ''; 
          historyToReplay.forEach(msg => {
             // Handle both [role, content] (server) and {role, content} (local) formats
             const role = Array.isArray(msg) ? msg[0] : msg.role;
             const content = Array.isArray(msg) ? msg[1] : msg.content;
             addMessage(role, content, false, true); // true = skip saving to avoid dupes
          });
          
          // Restore active options (server) or last known options (local)
          // Prefer local 'savedLastOptions' if server gives us the generic main menu (reset state)
          let optsToRestore = state.options;
          const serverIsGeneric = isPrimaryOptions(state.options);
          const localHasSecondary = savedLastOptions && savedLastOptions.length > 0 && !isPrimaryOptions(savedLastOptions);
          
          if (serverIsGeneric && localHasSecondary) {
             console.log('[FF-CHATBOT] Server returned generic menu, restoring local secondary menu');
             optsToRestore = savedLastOptions;
          } else if (!optsToRestore || optsToRestore.length === 0) {
             optsToRestore = savedLastOptions;
          }
          
          if (!optsToRestore || optsToRestore.length === 0) optsToRestore = PRIMARY_LIST;

          renderChatOptions(optsToRestore);
        } else {
          // No history - return to dashboard by default (or last view if you prefer)
          switchView(savedLastView === 'chat' ? 'chat' : 'dashboard');
          if (savedLastView === 'chat') {
            renderChatOptions(Array.isArray(savedLastOptions) && savedLastOptions.length > 0 ? savedLastOptions : PRIMARY_LIST);
          }
        }
        
        renderDashboard(PRIMARY_LIST);
      } else {
        console.log('[FF-CHATBOT] Saved session expired, creating new one for:', savedName);
        userName = savedName;
        if (userNameDisplay) userNameDisplay.textContent = userName;
        
        try {
          await startSession();
          // Prime server session so next button press is not treated as the name
          await sendNameToApi(userName);
          
          // REPLAY LOCAL HISTORY if available!
          if (savedHistory && savedHistory.length > 0) {
             console.log('[FF-CHATBOT] Replaying local history for new session');
             localHistory = savedHistory;
             saveSession(sessionId, userName); // Sync new ID with old history
             
             switchView('chat');
             chatMessages.innerHTML = '';
             savedHistory.forEach(msg => {
                const role = Array.isArray(msg) ? msg[0] : msg.role;
                const content = Array.isArray(msg) ? msg[1] : msg.content;
                addMessage(role, content, false, true);
             });

             // Restore last known options (since server session is new)
             renderChatOptions(Array.isArray(savedLastOptions) && savedLastOptions.length > 0 ? savedLastOptions : PRIMARY_LIST);
             
             // Important: We need to inform the server of this history context? 
             // Ideally yes, but for MVP just showing it is enough.
             // The user can continue chatting.
          } else {
             renderDashboard(PRIMARY_LIST);
             switchView('dashboard');
          }
        } catch (err) {
          console.error('[FF-CHATBOT] Failed to silent-start session:', err);
          ffClearPersistedSession();
        }
      }
    }
  } catch (e) {
    console.error('[FF-CHATBOT] Error restoring session:', e);
  }
}

function saveSession(id, name) {
  if (id && name) {
    ffSet("ff_session_id", id);
    ffSet("ff_user_name", name);
    // Also save current localHistory
    ffSet("ff_chat_history", JSON.stringify(localHistory));
    console.log('[FF-CHATBOT] Session & History saved');
  }
}

// --- Initialization ---
console.log('[FF-CHATBOT] Version 108 - mobile options: visual scroll indicator (fade on right edge)');

// Store reference to the latest user message for scrolling
let latestUserMessage = null;

// Robust scrolling inside the chat container (mobile-safe; avoids page-level scroll jumps)
let latestScrollTarget = null;
let latestScrollAlign = "start"; // "start" | "end"
let _pendingAutoScroll = false;

function setScrollTarget(el, align = "start") {
  latestScrollTarget = el;
  latestScrollAlign = align;
}

function scrollChatToTarget() {
  if (!chatMessages || !latestScrollTarget) return;
  if (!chatMessages.contains(latestScrollTarget)) return;

  const cRect = chatMessages.getBoundingClientRect();
  const eRect = latestScrollTarget.getBoundingClientRect();
  const current = chatMessages.scrollTop;

  const delta =
    latestScrollAlign === "end"
      ? eRect.bottom - cRect.bottom
      : eRect.top - cRect.top;

  // Small padding so content isn't flush against edges
  const padding = latestScrollAlign === "end" ? 8 : -8;
  chatMessages.scrollTop = Math.max(0, current + delta + padding);
}

function forceScrollToTop() {
  // Keep name for legacy calls: this now scrolls to the latest target (user selection or options)
  if (_pendingAutoScroll) return;
  _pendingAutoScroll = true;
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      _pendingAutoScroll = false;
      scrollChatToTarget();
    });
  });
}

function notifyParentPreventScroll() {
  // Disabled - was blocking mobile scroll
  // if (window.parent && window.parent !== window) {
  //   try {
  //     window.parent.postMessage({ type: 'prevent-scroll' }, '*');
  //   } catch(e) {}
  // }
}

// MutationObserver to prevent auto-scroll when content is added
// No MutationObserver needed - we scroll to top explicitly after adding content

window.addEventListener("load", () => {
  setInitialView();
  attachWelcomeListeners();
  if (nameInput) nameInput.focus();
  
  // Try to restore previous session
  restoreSession();

  // NOTE: Previously had a click interceptor here that broke links in Wix sandboxed iframes.
  // Now using native anchor tags with target="_blank" which work in sandboxes.
  // Do NOT intercept anchor clicks - let them work naturally.
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

  // Persist last view so we can restore UX after navigating between Wix pages
  try {
    ffSet("ff_last_view", viewName);
  } catch (e) {
    // ignore
  }

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
    // Save session immediately after creation
    saveSession(sessionId, name);
    
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
let _dashboardCardDelegationAttached = false;
let _dashboardLastTouchTs = 0;
let _dashboardTouchStartX = 0;
let _dashboardTouchStartY = 0;
let _dashboardTouchMoved = false;
let _dashboardActiveCard = null;

function _attachDashboardCardDelegation() {
  if (_dashboardCardDelegationAttached) return;
  const container = document.getElementById("dashboard-options");
  if (!container) return;

  // Tap-only touch handling (prevents "scrolling triggers taps" on mobile)
  container.addEventListener(
    "touchstart",
    (e) => {
      const card = e.target && e.target.closest ? e.target.closest(".card[data-opt]") : null;
      if (!card) {
        _dashboardActiveCard = null;
        return;
      }
      const t = e.touches && e.touches[0];
      if (!t) return;
      _dashboardActiveCard = card;
      _dashboardTouchMoved = false;
      _dashboardTouchStartX = t.clientX;
      _dashboardTouchStartY = t.clientY;
    },
    { passive: true }
  );

  container.addEventListener(
    "touchmove",
    (e) => {
      if (!_dashboardActiveCard) return;
      const t = e.touches && e.touches[0];
      if (!t) return;
      const dx = Math.abs(t.clientX - _dashboardTouchStartX);
      const dy = Math.abs(t.clientY - _dashboardTouchStartY);
      if (dx > 10 || dy > 10) _dashboardTouchMoved = true;
    },
    { passive: true }
  );

  container.addEventListener(
    "touchend",
    (e) => {
      if (!_dashboardActiveCard) return;
      const card = _dashboardActiveCard;
      _dashboardActiveCard = null;
      if (_dashboardTouchMoved) return; // it was a scroll, not a tap
      _dashboardLastTouchTs = Date.now();
      if (e.cancelable) e.preventDefault();
      e.stopPropagation();
      handleDashboardSelection(card.dataset.opt);
    },
    { passive: false }
  );

  container.addEventListener("touchcancel", () => {
    _dashboardActiveCard = null;
    _dashboardTouchMoved = false;
  });

  container.addEventListener("click", (e) => {
    const card = e.target && e.target.closest ? e.target.closest('.card[data-opt]') : null;
    if (!card) return;
    // Ignore ghost click after touch
    if (Date.now() - _dashboardLastTouchTs < 700) {
      e.preventDefault();
      return;
    }
    e.preventDefault();
    handleDashboardSelection(card.dataset.opt);
  });

  _dashboardCardDelegationAttached = true;
}

function renderDashboard(options) {
  const container = document.getElementById("dashboard-options");
  if (!container) {
    console.error("Dashboard options container not found!");
    return;
  }

  _attachDashboardCardDelegation();

  const optsToRender = (options && options.length > 0) ? options : PRIMARY_LIST;
  console.log("[FF-CHATBOT] Rendering dashboard with:", optsToRender);

  // Force styles to ensure visibility (Wix iframe edge cases)
  container.style.display = "grid";
  container.style.opacity = "1";
  container.style.visibility = "visible";
  container.style.border = "";
  container.style.background = "";

  let html = "";
  optsToRender.forEach((opt) => {
    try {
      const meta =
        DASHBOARD_CARD_META[opt] || {
          icon: "💡",
          gradient: "linear-gradient(135deg, #cfd8ff, #f7f6ff)",
          description: "Tap to explore this topic.",
          link: null,
        };

      const url = OPTION_LINKS && OPTION_LINKS[opt];
      if (url) {
        html += `
          <a class="card" href="${url}" target="_top" rel="noopener noreferrer">
            <div class="card-icon" style="background:${meta.gradient};">${meta.icon}</div>
            <div class="card-title">${opt}</div>
            <p class="card-desc">${meta.description}</p>
          </a>
        `;
      } else {
        html += `
          <div class="card" data-opt="${opt}">
            <div class="card-icon" style="background:${meta.gradient};">${meta.icon}</div>
            <div class="card-title">${opt}</div>
            <p class="card-desc">${meta.description}</p>
          </div>
        `;
      }
    } catch (err) {
      console.error("[FF-CHATBOT] Error rendering card:", opt, err);
    }
  });

  container.innerHTML = html;
}

async function restartExperience() {
  sessionId = null;
  userName = "";
  localHistory = [];
  ffClearPersistedSession();
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

function addMessage(role, content, shouldScroll = false, skipSave = false) {
  console.log('[DEBUG] addMessage called:', role, content?.substring(0, 50));
  
  if (!skipSave) {
    localHistory.push({ role, content });
    saveSession(sessionId, userName);
  }
  
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
    setScrollTarget(latestUserMessage, "start");
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

  // Persist last shown options so they can be restored after page navigation
  try {
    ffSet("ff_last_options", JSON.stringify(options || []));
  } catch (e) {
    // ignore
  }

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

  // Render options in ONE bubble (much shorter on mobile, easier to scroll/see all options)
  const msgDiv = document.createElement("div");
  msgDiv.className = "chat-message bot options-bubble options-grid-bubble";

  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.textContent = "FF";

  const bubble = document.createElement("div");
  bubble.className = "bubble bubble-options";

  const grid = document.createElement("div");
  grid.className = "options-grid";

  options.forEach((opt) => {
    let chip;
    if (OPTION_LINKS[opt]) {
      chip = document.createElement("a");
      chip.className = "suggestion-chip";
      chip.textContent = `💬 ${opt}`;
      chip.href = OPTION_LINKS[opt];
      chip.target = "_top";
      chip.rel = "noopener noreferrer";
    } else {
      chip = document.createElement("button");
      chip.className = "suggestion-chip";
      chip.textContent = `💬 ${opt}`;

      const run = () => {
        forceScrollToTop();
        notifyParentPreventScroll();
        addMessage("user", opt, false);
        sendMessageToApi(opt, { pinTop: true });
      };

      chip.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        run();
      });

      // Tap-only (ignore scroll gestures)
      let sx = 0, sy = 0, moved = false;
      chip.addEventListener("touchstart", (e) => {
        const t = e.touches && e.touches[0];
        if (!t) return;
        moved = false;
        sx = t.clientX;
        sy = t.clientY;
      }, { passive: true });
      chip.addEventListener("touchmove", (e) => {
        const t = e.touches && e.touches[0];
        if (!t) return;
        if (Math.abs(t.clientX - sx) > 10 || Math.abs(t.clientY - sy) > 10) moved = true;
      }, { passive: true });
      chip.addEventListener("touchend", (e) => {
        if (moved) return;
        if (e.cancelable) e.preventDefault();
        e.stopPropagation();
        run();
      }, { passive: false });
    }

    grid.appendChild(chip);
  });

  bubble.appendChild(grid);
  msgDiv.appendChild(avatar);
  msgDiv.appendChild(bubble);
  chatMessages.appendChild(msgDiv);

  // Scroll to ensure the options are visible
  // Use "start" so the prompt ("What would you like to explore?") is at the top, and user can scroll down if needed.
  // "end" was forcing the bottom of options to the bottom of view, which could hide the prompt/top options on small screens.
  setScrollTarget(promptDiv, "start");
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
    // If it's a link, use Method 1: <a target="_top">
    if (OPTION_LINKS[opt]) {
      const link = document.createElement("a");
      link.className = "footer-chip";
      link.textContent = `💬 ${opt}`;
      link.href = OPTION_LINKS[opt];
      link.target = "_top"; // Breaks out of iframe and navigates top window
      
      // Styling to match buttons
      link.style.textDecoration = "none"; 
      link.style.display = "inline-flex";
      link.style.alignItems = "center";
      
      link.onclick = (e) => {
        // Let the anchor tag do its job natively
        console.log('[DEBUG] Footer link clicked with target=_top:', opt);
      };
      primaryFooterOptions.appendChild(link);
    } else {
      const btn = document.createElement("button");
      btn.className = "footer-chip";
      btn.textContent = `💬 ${opt}`;
      
      const clickHandler = () => {
        console.log('[DEBUG] Footer button clicked:', opt);
        
        // Clear any pending prompts/bubbles when switching primary via footer
        if (chatMessages) {
          const oldOptionBubbles = chatMessages.querySelectorAll(".options-bubble, .options-prompt");
          oldOptionBubbles.forEach((el) => el.remove());
        }
        
        forceScrollToTop();
        notifyParentPreventScroll();
        addMessage("user", opt, false);
        sendMessageToApi(opt, { pinTop: true });
      };
      
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        clickHandler();
      });

      // Tap-only for mobile (ignore scroll gestures)
      let sx = 0, sy = 0, moved = false;
      btn.addEventListener("touchstart", (e) => {
        const t = e.touches && e.touches[0];
        if (!t) return;
        moved = false;
        sx = t.clientX;
        sy = t.clientY;
      }, { passive: true });
      btn.addEventListener("touchmove", (e) => {
        const t = e.touches && e.touches[0];
        if (!t) return;
        if (Math.abs(t.clientX - sx) > 10 || Math.abs(t.clientY - sy) > 10) moved = true;
      }, { passive: true });
      btn.addEventListener("touchend", (e) => {
        if (moved) return;
        if (e.cancelable) e.preventDefault();
        clickHandler();
      }, { passive: false });
      
      primaryFooterOptions.appendChild(btn);
    }
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
  return set.has("Methodology") && set.has("Key Findings");
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
