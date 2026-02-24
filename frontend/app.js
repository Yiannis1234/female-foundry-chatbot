// Version: 108

// === CONSTANTS & CONFIG ===

const API_BASE = "/api";
const BOT_AVATAR = "IX";
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// === STATE ===
let sessionId = null;
let userName = "";
let currentView = "welcome"; // welcome, dashboard, chat

// === DOM ELEMENTS ===
const views = {
  welcome: document.getElementById("view-welcome"),
  dashboard: document.getElementById("view-dashboard"),
  chat: document.getElementById("view-chat"),
};

const topBar = document.querySelector(".top-bar");
const appContainer = document.querySelector(".app-container");

const nameForm = document.getElementById("name-form");
const nameInput = document.getElementById("name-input");
const askIndexBtn = document.getElementById("ask-index-btn");
const closeChatBtn = document.getElementById("close-chat");
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
const headerBackBtn = document.getElementById("header-back-btn");

// Mark when embedded (Wix iframe) so CSS can adapt sizing
(() => {
  try {
    if (window.self !== window.top) document.body.classList.add("in-iframe");
  } catch (e) {
    // Cross-origin access can throw — if it does, assume we're in an iframe
    document.body.classList.add("in-iframe");
  }
})();

/**
 * Navigate the top-level page (or Wix parent) to a URL.
 * Falls back to window.open() when cross-origin restrictions block top-frame navigation.
 * @param {string} url - The URL to open.
 */
function openExternal(url) {
  // 1) Ask parent (Wix) to navigate via postMessage
  try {
    window.parent.postMessage({ type: 'openLink', url }, '*');
  } catch (e) { /* ignore */ }

  // 2) Try navigating the top window (if allowed)
  try {
    // If we can access top, navigate it
    window.top.location.href = url;
  } catch (e) {
    // 3) Security Error (Cross-Origin): We cannot navigate the parent page.
    // FALBACK: Open in a NEW TAB.
    // CRITICAL: Do NOT use window.location.href here, or the site loads INSIDE the widget!
    window.open(url, '_blank');
  }
}

// === DASHBOARD CARD DATA ===
const PRIMARY_LIST = [
  "The AI Era",
  "Key Insights",
  "Idea",
  "Fundraising trends",
  "Behind the Index",
  "About Female Foundry",
];

const DASHBOARD_CARD_META = {
  "The AI Era": {
    icon: "🌌",
    background: "#FF0000", // EXACT RED from website - Agata's feedback
    description:
      "Learn how AI is redefining how female founders build and solve the next generation of problems.",
    link: null,
  },
  // Legacy label support (older sessions)
  "The Era of Abundance": {
    icon: "🌌",
    background: "#FF0000",
    description:
      "Learn how AI is redefining how female founders build and solve the next generation of problems.",
    link: null,
  },
  "Key Insights": {
    icon: "💡",
    background: "#FF0000", // EXACT RED from website - Agata's feedback
    description:
      "Explore the key insights captured in the 2026 Edition of the Index and the methodology behind the data.",
    link: null,
  },
  Idea: {
    icon: "✨",
    background: "#FF0000", // EXACT RED from website - Agata's feedback
    description:
      "Explore where newly-minted female founders are emerging today—and what motivates them to start their companies.",
    link: null,
  },
  "Fundraising trends": {
    icon: "📈",
    background: "#FF0000", // EXACT RED from website - Agata's feedback
    description:
      "Dive into the fundraising data and see where capital is flowing for female-founded companies across Europe.",
    link: null,
  },
  "Behind the Index": {
    icon: "🤝",
    background: "#FF0000", // EXACT RED from website - Agata's feedback
    description:
      "See who is behind the Female Innovation Index—meet our team, the sponsors, the contributors, and the partners.",
    link: null,
  },
  "About Female Foundry": {
    icon: "🏛️",
    background: "#FF0000",
    description:
      "Learn more about Female Foundry, the founding initiative that powers the Female Innovation Index every year.",
    link: null,
  },
};

// === OPTION LINKS ===
const OPTION_LINKS = {
  // Primary (Dashboard)
  "The AI Era": "https://www.aivisionaries.co/",
  "The Era of Abundance": "https://www.aivisionaries.co/", // legacy support
  Idea: "https://www.femaleinnovationindex.com/idea",
  "About Female Foundry": "https://www.femalefoundry.co/",
  // Fundraising trends (Opens Sub-menu, NO LINK)
  // "Fundraising trends": "https://www.femaleinnovationindex.com/2024-funding-overview",
  
  // Secondary (Chat buttons)
  "Methodology": "https://www.femaleinnovationindex.com/methodology",
  "Key Findings": "https://www.femaleinnovationindex.com/innovation",
  "The Team": "https://www.femaleinnovationindex.com/?target=team",
  "The Sponsors": "https://www.femaleinnovationindex.com/?target=partners",
  "The Contributors": "https://www.femaleinnovationindex.com/?target=partners",
  "The Partners": "https://www.femaleinnovationindex.com/?target=partners",

  // Fundraising submenu links
  "Funding Data": "https://www.femaleinnovationindex.com/2024-funding-overview",
  "By Country Analysis": "https://www.femaleinnovationindex.com/location",
  "By Sector Analysis": "https://www.femaleinnovationindex.com/sector",
  "Top Funding Rounds": "https://www.femaleinnovationindex.com/impact?target=top-funding-rounds",
  "IPOs and Exits": "https://www.femaleinnovationindex.com/impact?target=ipos-exits",
  "Focus on Deeptech": "https://www.femaleinnovationindex.com/deeptech",

  // Lowercase fallbacks (just in case)
  "Funding data": "https://www.femaleinnovationindex.com/2024-funding-overview",
  "By country analysis": "https://www.femaleinnovationindex.com/location",
  "By sector analysis": "https://www.femaleinnovationindex.com/sector",
  "Top funding rounds": "https://www.femaleinnovationindex.com/impact?target=top-funding-rounds",
  "Focus on DEEPTECH": "https://www.femaleinnovationindex.com/deeptech",
};

// === SESSION PERSISTENCE ===
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

/** @param {string} key @returns {string|null} */
function ffGet(key) {
  try {
    return FF_PERSIST ? FF_PERSIST.getItem(key) : null;
  } catch (e) {
    return null;
  }
}

/** @param {string} key @param {string} value */
function ffSet(key, value) {
  try {
    if (FF_PERSIST) FF_PERSIST.setItem(key, value);
  } catch (e) {
    // ignore
  }
}

/** @param {string} key */
function ffRemove(key) {
  try {
    if (FF_PERSIST) FF_PERSIST.removeItem(key);
  } catch (e) {
    // ignore
  }
}

/** Clears all persisted session keys from sessionStorage (and legacy localStorage). */
function ffClearPersistedSession() {
  ["ff_session_id", "ff_user_name", "ff_chat_history", "ff_last_options", "ff_last_view"].forEach((k) => {
    ffRemove(k);
    // Also clear legacy localStorage so it doesn't sync across devices
    try { localStorage.removeItem(k); } catch (e) {}
  });
}

/**
 * On page load, check sessionStorage for a saved session.
 * If found, verify it with the server and replay chat history.
 * If the server session has expired, create a new one and replay local history.
 */
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
      // Hide "Ask the Index" button since we have a saved session
      if (askIndexBtn) askIndexBtn.classList.add("hidden");
      
      // Verify session with server
      const res = await fetch(`${API_BASE}/session/${savedId}`);
      if (res.ok) {
        const state = await res.json();
        sessionId = savedId;
        userName = (state && state.visitor_name) ? state.visitor_name : savedName;
        if (userNameDisplay) userNameDisplay.textContent = userName;

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
        userName = savedName;
        if (userNameDisplay) userNameDisplay.textContent = userName;
        // Keep "Ask the Index" button hidden since we have a saved name
        if (askIndexBtn) askIndexBtn.classList.add("hidden");
        
        try {
          await startSession();
          // Prime server session so next button press is not treated as the name
          await sendNameToApi(userName);
          
          // REPLAY LOCAL HISTORY if available!
          if (savedHistory && savedHistory.length > 0) {
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

/**
 * Persist the current session ID, username, and chat history to sessionStorage.
 * @param {string} id - The session ID returned by the server.
 * @param {string} name - The visitor's name.
 */
function saveSession(id, name) {
  if (id && name) {
    ffSet("ff_session_id", id);
    ffSet("ff_user_name", name);
    // Also save current localHistory
    ffSet("ff_chat_history", JSON.stringify(localHistory));
  }
}

// === INITIALISATION ===

// Store reference to the latest user message for scrolling
let latestUserMessage = null;

// Robust scrolling inside the chat container (mobile-safe; avoids page-level scroll jumps)
let latestScrollTarget = null;
let latestScrollAlign = "start"; // "start" | "end"
let _pendingAutoScroll = false;
let _pinToTop = false; // When true, prevent auto-scroll to bottom

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

// Helper to scroll a message element to the top of chat container
function scrollMessageToTop(messageElement) {
  if (!messageElement || !chatMessages) return;
  if (!chatMessages.contains(messageElement)) return;

  // Force layout reflow by reading offsetHeight BEFORE calculating offsetTop
  // This ensures layout is complete before we scroll
  void messageElement.offsetHeight;
  void chatMessages.offsetHeight;
  
  // Now calculate and set scroll position
  const offset = messageElement.offsetTop;
  chatMessages.scrollTop = Math.max(0, offset - 8);
}

// Simple top lock helper
function forceTop() {
  if (chatMessages) chatMessages.scrollTop = 0;
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

// === VIEW ROUTING ===

/**
 * Switch the visible view (welcome | dashboard | chat).
 * Handles header visibility, background, and "Ask the Index" button state.
 * @param {string} viewName - One of "welcome", "dashboard", or "chat".
 */
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

  // Show/hide header based on view
  const topBar = document.querySelector(".top-bar");
  if (viewName === "welcome") {
    if (topBar) topBar.classList.add("hidden");
    document.body.classList.remove("show-bg");
    // Only show the button if user hasn't entered name yet
    if (askIndexBtn && !userName) {
      askIndexBtn.classList.remove("hidden");
    }
  } else {
    if (topBar) topBar.classList.remove("hidden");
    document.body.classList.add("show-bg");
    // CRITICAL: ALWAYS hide "Ask the Index" button when not on welcome view
    if (askIndexBtn) {
      askIndexBtn.classList.add("hidden");
    }
  }

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

// === WELCOME FLOW ===
function attachWelcomeListeners() {
  if (nameForm) {
    nameForm.addEventListener("submit", (e) => {
      e.preventDefault();
      submitName();
    });
  }

  if (askIndexBtn) {
    askIndexBtn.addEventListener("click", () => {
      askIndexBtn.classList.add("hidden");
      if (nameForm) nameForm.classList.remove("hidden");
      if (nameInput) nameInput.focus();
      if (appContainer) appContainer.classList.add("panel-active");
      // Header will be shown automatically when switching to dashboard/chat
    });
  }

  if (closeChatBtn) {
    closeChatBtn.addEventListener("click", () => {
      // Simple close: reset to welcome state and clear session
      ffClearPersistedSession();
      localHistory = [];
      sessionId = null;
      userName = "";
      if (nameInput) nameInput.value = "";
      if (nameForm) {
        nameForm.classList.add("hidden");
      }
      if (askIndexBtn) {
        askIndexBtn.classList.remove("hidden");
      }
      if (topBar) {
        topBar.classList.add("hidden");
      }
      if (appContainer) appContainer.classList.remove("panel-active");
      document.body.classList.remove("show-bg");
      switchView("welcome");
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

/**
 * Read the name input, create a server session, and navigate to the dashboard.
 */
async function submitName() {
  const name = nameInput ? nameInput.value.trim() : "";
  if (!name) return;

  userName = name;
  if (userNameDisplay) userNameDisplay.textContent = name;
  if (askIndexBtn) askIndexBtn.classList.add("hidden");
  if (nameForm) nameForm.classList.add("hidden");

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

// === DASHBOARD ===
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
      const card = e.target && e.target.closest ? e.target.closest(".card") : null;
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
      
      if (card.dataset.link) {
        openExternal(card.dataset.link);
      } else if (card.dataset.opt) {
        handleDashboardSelection(card.dataset.opt);
      }
    },
    { passive: false }
  );

  container.addEventListener("touchcancel", () => {
    _dashboardActiveCard = null;
    _dashboardTouchMoved = false;
  });

  container.addEventListener("click", (e) => {
    const card = e.target && e.target.closest ? e.target.closest('.card') : null;
    if (!card) return;
    
    // Ignore ghost click after touch
    if (Date.now() - _dashboardLastTouchTs < 700) {
      e.preventDefault();
      return;
    }
    e.preventDefault();

    if (card.dataset.link) {
      openExternal(card.dataset.link);
    } else if (card.dataset.opt) {
      handleDashboardSelection(card.dataset.opt);
    }
  });

  _dashboardCardDelegationAttached = true;
}

/**
 * Render the topic cards in the dashboard grid.
 * Cards with a URL in OPTION_LINKS navigate externally; others enter the chat flow.
 * @param {string[]} options - List of topic names to render.
 */
function renderDashboard(options) {
  const container = document.getElementById("dashboard-options");
  if (!container) {
    console.error("Dashboard options container not found!");
    return;
  }

  _attachDashboardCardDelegation();

  const optsToRenderRaw = (options && options.length > 0) ? options : PRIMARY_LIST;
  const optsToRender = Array.from(
    new Set(
      optsToRenderRaw
        .filter((o) => o)
        .map((o) => (o === "The Era of Abundance" ? "The AI Era" : o))
    )
  );
  // FORCE 2 COLUMNS ALWAYS - user wants 2 per row even in narrow iframes
  container.style.display = "grid";
  container.style.gridTemplateColumns = "repeat(2, minmax(0, 1fr))";
  container.style.gridAutoRows = "auto";
  container.style.columnGap = "3px";
  container.style.rowGap = "3px";
  container.style.alignItems = "stretch";
  container.style.justifyItems = "stretch";
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
          background: "#FF0000", // EXACT RED from website
          description: "Tap to explore this topic.",
          link: null,
        };

      const url = OPTION_LINKS && OPTION_LINKS[opt];
      if (url) {
        html += `
          <div class="card" data-link="${url}">
            <div class="card-title">${opt}</div>
            <p class="card-desc">${meta.description}</p>
          </div>
        `;
      } else {
        html += `
          <div class="card" data-opt="${opt}">
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
  
  // Show the name form so user can start again
  if (nameForm) nameForm.classList.remove("hidden");
  if (nameInput) nameInput.focus();
  
  // Hide the "Ask the Index" button since we're showing the form
  if (askIndexBtn) askIndexBtn.classList.add("hidden");
}

async function handleDashboardSelection(text) {
  switchView("chat");
  
  // CRITICAL: Wait for chat view to fully render and layout (FIRST TIME needs more time!)
  await sleep(200);
  
  // CRITICAL: Set pinToTop flag FIRST to prevent any auto-scrolling
  _pinToTop = true;
  
  // Clear chat and reset scroll
  if (chatMessages) {
    chatMessages.scrollTop = 0;
  }
  
  // Add user message (pinToTop is already true, so it won't auto-scroll)
  addMessage("user", text, false);
  
  // Wait for DOM to fully update and layout to be calculated
  await sleep(150);
  
  // Scroll so the user message appears at the TOP of the visible area
  const lockUserMessageToTop = () => {
    if (latestUserMessage && chatMessages && _pinToTop) {
      scrollMessageToTop(latestUserMessage);
    }
  };
  
  // SUPER AGGRESSIVE initial locks - MORE attempts with LONGER delays
  for (let i = 0; i < 8; i++) {
    lockUserMessageToTop();
    await sleep(30);
  }
  
  // Less aggressive lock - 150ms interval instead of 50ms
  let lockInterval = setInterval(lockUserMessageToTop, 150);
  let isManualScrolling = false;
  
  // Detect manual scroll and IMMEDIATELY stop locking
  const detectManualScroll = () => {
    if (!isManualScrolling) {
      isManualScrolling = true;
      clearInterval(lockInterval);
      _pinToTop = false;
      if (chatMessages) {
        chatMessages.removeEventListener('scroll', detectManualScroll);
      }
    }
  };
  
  if (chatMessages) {
    chatMessages.addEventListener('scroll', detectManualScroll, { passive: true, once: true });
  }
  
  // Auto-stop after 2 seconds (more time for first load)
  setTimeout(() => {
    clearInterval(lockInterval);
    _pinToTop = false;
    if (chatMessages) {
      chatMessages.removeEventListener('scroll', detectManualScroll);
    }
  }, 2000);
  
  await sendMessageToApi(text, { pinTop: true });
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

// === CHAT FLOW ===

/**
 * Send a user message to the backend and render the bot's response.
 * @param {string} text - The message text.
 * @param {Object} [opts]
 * @param {boolean} [opts.pinTop=false] - When true, keep the user's message pinned
 *   to the top of the viewport while bot replies animate in below.
 */
async function sendMessageToApi(text, { pinTop = false } = {}) {
  if (!sessionId) {
    console.error('[DEBUG] No sessionId! Cannot send message.');
    addMessage("bot", "Session not started. Please refresh and try again.", false);
    return;
  }

  // Set pin to top flag
  _pinToTop = pinTop;

  showTyping();
  try {
    const res = await fetch(`${API_BASE}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId, message: text }),
    });
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const data = await res.json();
    hideTyping();

    if (pinTop && latestUserMessage) {
      // Lock user message to top of visible area
      const lockUserToTop = () => {
        if (latestUserMessage && chatMessages) {
          const offset = latestUserMessage.offsetTop;
          chatMessages.scrollTop = Math.max(0, offset - 8);
        }
      };
      lockUserToTop();
      setTimeout(lockUserToTop, 10);
      setTimeout(lockUserToTop, 30);
      setTimeout(lockUserToTop, 60);
      setTimeout(lockUserToTop, 100);
      notifyParentPreventScroll();
    }
    
    if (data.messages && data.messages.length > 0) {
      let lastDelay = 0;
      for (let i = 0; i < data.messages.length; i++) {
        const msg = data.messages[i];
        const segmentDelay = addMessage(msg.role, msg.content, false) || 0;
        lastDelay = segmentDelay;
        // Keep user message at top after each bot message when pinTop is active
        if (pinTop && latestUserMessage) {
          const lockUserToTop = () => {
            if (latestUserMessage && chatMessages) {
              const offset = latestUserMessage.offsetTop;
              chatMessages.scrollTop = Math.max(0, offset - 8);
            }
          };
          lockUserToTop();
          setTimeout(lockUserToTop, 10);
          setTimeout(lockUserToTop, 30);
          setTimeout(lockUserToTop, 60);
        }
        if (i < data.messages.length - 1) {
          // If this message is split into multiple segments, wait for them to render
          // so the conversation flows clearly left→right / right→left.
          await sleep(Math.max(520, segmentDelay + 220));
        }
      }
      
      // CRITICAL: Wait for last message segments to finish rendering
      await sleep(lastDelay + 140);
      
      // Now render options AFTER all message segments
      renderChatOptions(data.options);
    } else {
      renderChatOptions(data.options);
    }

    if (pinTop && latestUserMessage) {
      // Keep user message at top after all messages render
      const lockUserToTop = () => {
        if (latestUserMessage && chatMessages && _pinToTop) {
          const offset = latestUserMessage.offsetTop;
          chatMessages.scrollTop = Math.max(0, offset - 8);
        }
      };
      
      // Less aggressive lock - 150ms interval, shorter duration
      const lockInterval = setInterval(lockUserToTop, 150);
      setTimeout(() => {
        clearInterval(lockInterval);
        _pinToTop = false;
      }, 1000);
      
      // Initial locks
      lockUserToTop();
      setTimeout(lockUserToTop, 20);
      setTimeout(lockUserToTop, 100);
      setTimeout(lockUserToTop, 300);
    } else {
      _pinToTop = false;
    }
  } catch (err) {
    console.error('[DEBUG] API error:', err);
    hideTyping();
    addMessage("bot", "Sorry, something went wrong. Error: " + err.message, false);
    if (pinTop) forceScrollToTop();
  }
}

/**
 * Append a chat message bubble to the chat window.
 * Bot messages with multiple sentences are split into staggered segments.
 * @param {string} role - "user" or "bot".
 * @param {string} content - HTML content for the bubble.
 * @param {boolean} [shouldScroll=false] - Scroll to bottom after adding.
 * @param {boolean} [skipSave=false] - Skip saving to localHistory (used when replaying).
 * @returns {number} Total stagger delay in ms (0 for user messages).
 */
function addMessage(role, content, shouldScroll = false, skipSave = false) {
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

  let firstMsgDiv = null;

  const totalSegments = segments.length;
  const appendSegment = (segment, index) => {
    const msgDiv = document.createElement("div");
    msgDiv.className = `chat-message ${role}`;
    
    // For restored history, disable animations.
    // For live messages, we rely on segment scheduling (below) for staggered flow.
    if (skipSave) msgDiv.style.animation = "none";

    const avatar = document.createElement("div");
    avatar.className = "avatar";
    if (role === "bot") {
      avatar.textContent = totalSegments > 1 && index > 0 ? "" : BOT_AVATAR;
      if (totalSegments > 1 && index > 0) {
        avatar.classList.add("avatar-placeholder");
      }
    } else {
      avatar.textContent = ""; // NO "You" label
    }

    const bubble = document.createElement("div");
    bubble.className = "bubble";
    bubble.innerHTML = segment;

    msgDiv.appendChild(avatar);
    msgDiv.appendChild(bubble);
    chatMessages.appendChild(msgDiv);

    // Store reference to first message of this batch
    if (index === 0) {
      firstMsgDiv = msgDiv;
    }

    // Only auto-scroll if not pinning to top; otherwise force stay at top
    if (!_pinToTop) {
      requestAnimationFrame(() => {
        if (chatMessages) {
          chatMessages.scrollTop = chatMessages.scrollHeight;
        }
      });
    } else if (latestUserMessage) {
      const lockUserToTop = () => scrollMessageToTop(latestUserMessage);
      lockUserToTop();
      requestAnimationFrame(lockUserToTop);
      setTimeout(lockUserToTop, 20);
    }
  };

  const SEGMENT_STAGGER_MS = 560; // more delay so direction is obvious
  if (role === "bot" && totalSegments > 1) {
    segments.forEach((segment, index) => {
      setTimeout(() => appendSegment(segment, index), index * SEGMENT_STAGGER_MS);
    });
    // Return the total delay time so caller can wait
    return (totalSegments - 1) * SEGMENT_STAGGER_MS;
  } else {
    appendSegment(segments[0], 0);
    return 0;
  }
  
  // If this is a user message, store it for scroll targeting
  if (role === "user" && firstMsgDiv) {
    latestUserMessage = firstMsgDiv;
    setScrollTarget(latestUserMessage, "start");
    if (_pinToTop) {
      const lockUserToTop = () => scrollMessageToTop(firstMsgDiv);
      lockUserToTop();
      requestAnimationFrame(lockUserToTop);
      setTimeout(lockUserToTop, 20);
    }
  }

  // Only scroll to bottom if explicitly requested (user typing) and not pinning to top
  if (shouldScroll && !_pinToTop) {
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

/**
 * Render suggestion chips for the available options.
 * Primary options (the 6 main topics) go to the footer; secondary options render
 * inline as a grid bubble in the chat window.
 * @param {string[]} options - Option labels returned by the API.
 */
function renderChatOptions(options) {
  if (!chatMessages) return;

  const cleanedOptions = Array.isArray(options)
    ? Array.from(
        new Set(
          options
            .filter((o) => o)
            .map((o) => (o === "The Era of Abundance" ? "The AI Era" : o))
        )
      )
    : [];

  // Persist last shown options so they can be restored after page navigation
  try {
    ffSet("ff_last_options", JSON.stringify(cleanedOptions));
  } catch (e) {
    // ignore
  }

  // Footer should always show the primary 6
  renderPrimaryFooterOptions(PRIMARY_LIST);

  // Remove any previous option bubbles/prompts
  const oldOptionBubbles = chatMessages.querySelectorAll(".options-bubble, .options-prompt");
  oldOptionBubbles.forEach((el) => el.remove());

  if (!cleanedOptions || cleanedOptions.length === 0) {
    return;
  }

  // If these are the primary 6, show them in the footer and skip inline bubble
  if (isPrimaryOptions(cleanedOptions)) {
    return;
  }

  // NO PROMPT - the server response already includes the intro text (e.g. "Love it — let's dig in!")
  // Render options in ONE bubble (much shorter on mobile, easier to scroll/see all options)
  const msgDiv = document.createElement("div");
  msgDiv.className = "chat-message bot options-bubble options-grid-bubble";

  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.textContent = BOT_AVATAR;

  const bubble = document.createElement("div");
  bubble.className = "bubble bubble-options";

  const grid = document.createElement("div");
  const optionCount = cleanedOptions.length;
  const cols =
    optionCount <= 2 ? Math.max(1, optionCount) : optionCount === 4 ? 2 : 3;
  grid.className = `options-grid cols-${cols}`;

  cleanedOptions.forEach((opt) => {
    let chip;
    if (OPTION_LINKS[opt]) {
      chip = document.createElement("button");
      chip.className = "suggestion-chip"; // styled as dark grey (#313030)
      chip.textContent = opt;
      chip.onclick = () => openExternal(OPTION_LINKS[opt]);
    } else {
      chip = document.createElement("button");
      chip.className = "suggestion-chip";
      chip.textContent = opt;

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

  // No scrolling needed - natural flow
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
    // If it's a link, use Method 1: JS PostMessage
    if (OPTION_LINKS[opt]) {
      const link = document.createElement("button");
      link.className = "footer-chip";
      link.textContent = opt;
      
      link.onclick = (e) => {
        e.preventDefault();
        openExternal(OPTION_LINKS[opt]);
      };
      primaryFooterOptions.appendChild(link);
    } else {
      const       btn = document.createElement("button");
      btn.className = "footer-chip";
      btn.textContent = opt;
      
      const clickHandler = () => {
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
  if (!Array.isArray(opts)) return false;

  // Backwards compatible: older server/UI included:
  // - "The Era of Abundance" (now "The AI Era")
  const normalized = opts
    .filter((o) => o)
    .map((o) => (o === "The Era of Abundance" ? "The AI Era" : o));

  if (normalized.length !== PRIMARY_LIST.length) return false;
  const primarySet = new Set(PRIMARY_LIST);
  return normalized.every((o) => primarySet.has(o));
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

// === UTILITIES ===
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
  backBtn.addEventListener("click", () => {
    // Ensure red button stays hidden
    if (askIndexBtn) askIndexBtn.classList.add("hidden");
    switchView("dashboard");
  });
}

if (resetBtn) {
  resetBtn.addEventListener("click", () => {
    if (confirm("Start a new session?")) {
      restartExperience();
    }
  });
}

if (restartFlowBtn) {
  restartFlowBtn.addEventListener("click", () => {
    // Go back to name input view, don't restart everything
    if (nameForm) nameForm.classList.remove("hidden");
    // CRITICAL: Keep button hidden since user already has a session
    if (askIndexBtn) askIndexBtn.classList.add("hidden");
    switchView("welcome");
    // Reset to initial state but keep session
    if (nameInput) nameInput.value = "";
    if (nameInput) nameInput.focus();
  });
}

// Header back button - goes to dashboard
if (headerBackBtn) {
  headerBackBtn.addEventListener("click", () => {
    // Ensure red button stays hidden
    if (askIndexBtn) askIndexBtn.classList.add("hidden");
    switchView("dashboard");
  });
}
