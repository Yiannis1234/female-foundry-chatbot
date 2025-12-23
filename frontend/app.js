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
// Flag to prevent auto-scroll when clicking options
let preventAutoScroll = false;

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
let scrollObserver = null;
if (chatMessages) {
  // AGGRESSIVE: Prevent ALL scroll events when preventAutoScroll is true
  chatMessages.addEventListener('scroll', (e) => {
    if (preventAutoScroll) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      chatMessages.scrollTop = 0;
      return false;
    }
  }, { passive: false, capture: true });
  
  // Also prevent wheel events
  chatMessages.addEventListener('wheel', (e) => {
    if (preventAutoScroll) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      return false;
    }
  }, { passive: false, capture: true });
  
  // Prevent touchmove events
  chatMessages.addEventListener('touchmove', (e) => {
    if (preventAutoScroll) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      return false;
    }
  }, { passive: false, capture: true });
  
  scrollObserver = new MutationObserver(() => {
    if (preventAutoScroll && chatMessages) {
      // Immediately reset scroll to top when content changes
      chatMessages.scrollTop = 0;
      chatMessages.style.overflow = 'hidden';
      // Also use requestAnimationFrame for immediate effect
      requestAnimationFrame(() => {
        if (chatMessages) {
          chatMessages.scrollTop = 0;
          chatMessages.style.overflow = 'hidden';
        }
      });
      // Multiple attempts to ensure it stays at top
      setTimeout(() => {
        if (chatMessages) {
          chatMessages.scrollTop = 0;
          chatMessages.style.overflow = 'hidden';
        }
      }, 0);
      setTimeout(() => {
        if (chatMessages) {
          chatMessages.scrollTop = 0;
          chatMessages.style.overflow = 'hidden';
        }
      }, 10);
    }
  });
  
  scrollObserver.observe(chatMessages, {
    childList: true,
    subtree: true
  });
}

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

  // When switching to chat view, scroll to top to show the start
  if (viewName === "chat") {
    setTimeout(() => {
      if (chatMessages) {
        chatMessages.scrollTop = 0;
      }
    }, 50);
    setTimeout(() => {
      if (chatMessages) {
        chatMessages.scrollTop = 0;
      }
    }, 200);
    setTimeout(() => {
      if (chatMessages) {
        chatMessages.scrollTop = 0;
      }
    }, 400);
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
  switchView("chat");
  addMessage("user", text, false); // Don't scroll when clicking from dashboard
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
    openExternal(OPTION_LINKS[text]);
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
    
    // AGGRESSIVE: Keep scroll locked
    preventAutoScroll = true;
    if (chatMessages) {
      chatMessages.classList.add('prevent-scroll');
      chatMessages.scrollTop = 0;
      chatMessages.style.overflow = 'hidden';
      chatMessages.style.scrollBehavior = 'auto';
    }
    notifyParentPreventScroll();
    
    // Force scroll to top BEFORE adding messages - multiple times
    if (chatMessages) {
      chatMessages.scrollTop = 0;
      chatMessages.scrollTop = 0;
      chatMessages.scrollTop = 0;
    }
    
    if (data.messages) {
      data.messages.forEach((msg) => addMessage(msg.role, msg.content, false));
    }
    
    // Keep locked AFTER adding messages
    if (chatMessages) {
      chatMessages.scrollTop = 0;
      chatMessages.style.overflow = 'hidden';
    }
    
    renderChatOptions(data.options);
    
    // Keep locked - NEVER unlock unless user types
    if (chatMessages) {
      chatMessages.scrollTop = 0;
      chatMessages.style.overflow = 'hidden';
    }
    
    // AGGRESSIVE: Continuous lock - check EVERY frame
    let lockInterval = null;
    const keepLocked = () => {
      if (chatMessages && preventAutoScroll) {
        chatMessages.scrollTop = 0;
        chatMessages.style.overflow = 'hidden';
        chatMessages.classList.add('prevent-scroll');
        // Keep checking continuously
        requestAnimationFrame(keepLocked);
      }
    };
    
    // Start continuous locking immediately
    keepLocked();
    requestAnimationFrame(keepLocked);
    
    // Also use interval as backup
    if (lockInterval) clearInterval(lockInterval);
    lockInterval = setInterval(() => {
      if (chatMessages && preventAutoScroll) {
        chatMessages.scrollTop = 0;
        chatMessages.style.overflow = 'hidden';
        chatMessages.classList.add('prevent-scroll');
      } else {
        clearInterval(lockInterval);
        lockInterval = null;
      }
    }, 16); // ~60fps
    
    setTimeout(() => {
      if (chatMessages && preventAutoScroll) {
        keepLocked();
      }
    }, 0);
    setTimeout(() => {
      if (chatMessages && preventAutoScroll) {
        keepLocked();
      }
    }, 10);
    setTimeout(() => {
      if (chatMessages && preventAutoScroll) {
        keepLocked();
      }
    }, 50);
    setTimeout(() => {
      if (chatMessages && preventAutoScroll) {
        keepLocked();
      }
    }, 100);
    setTimeout(() => {
      if (chatMessages && preventAutoScroll) {
        keepLocked();
      }
    }, 200);
    setTimeout(() => {
      if (chatMessages && preventAutoScroll) {
        keepLocked();
      }
    }, 400);
  } catch (err) {
    console.error(err);
    hideTyping();
    addMessage("bot", "Sorry, something went wrong.", false);
  }
}

function addMessage(role, content, shouldScroll = false) {
  if (!chatMessages) return;

  // Store scroll position to prevent auto-scroll
  const oldScrollTop = chatMessages.scrollTop;

  const segments =
    role === "bot" ? splitBotContent(content) : [content];

  segments.forEach((segment) => {
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
    
    // Store scroll position before adding
    const scrollBefore = chatMessages.scrollTop;
    
    chatMessages.appendChild(msgDiv);
    
    // Immediately prevent scroll after each message is added
    if (!shouldScroll && preventAutoScroll) {
      chatMessages.scrollTop = 0;
      // Use multiple methods to prevent scroll
      requestAnimationFrame(() => {
        if (chatMessages) {
          chatMessages.scrollTop = 0;
        }
      });
    }
  });

  // Only scroll to bottom if explicitly requested (user typing)
  if (shouldScroll) {
    preventAutoScroll = false; // Allow scrolling when user types
    if (chatMessages) {
      chatMessages.classList.remove('prevent-scroll');
      chatMessages.style.overflow = 'auto';
    }
    requestAnimationFrame(() => {
      if (chatMessages) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }
    });
  } else {
    // AGGRESSIVE: Force stay at top - lock it COMPLETELY
    if (preventAutoScroll && chatMessages) {
      chatMessages.classList.add('prevent-scroll');
      chatMessages.scrollTop = 0;
      chatMessages.style.overflow = 'hidden';
      chatMessages.style.scrollBehavior = 'auto';
      // Multiple synchronous resets
      chatMessages.scrollTop = 0;
      chatMessages.scrollTop = 0;
      chatMessages.scrollTop = 0;
      // Use requestAnimationFrame for immediate lock
      requestAnimationFrame(() => {
        if (chatMessages && preventAutoScroll) {
          chatMessages.scrollTop = 0;
          chatMessages.style.overflow = 'hidden';
          chatMessages.classList.add('prevent-scroll');
        }
      });
      // Multiple timeouts to keep locked
      setTimeout(() => {
        if (chatMessages && preventAutoScroll) {
          chatMessages.scrollTop = 0;
          chatMessages.style.overflow = 'hidden';
        }
      }, 0);
      setTimeout(() => {
        if (chatMessages && preventAutoScroll) {
          chatMessages.scrollTop = 0;
          chatMessages.style.overflow = 'hidden';
        }
      }, 10);
      setTimeout(() => {
        if (chatMessages && preventAutoScroll) {
          chatMessages.scrollTop = 0;
          chatMessages.style.overflow = 'hidden';
        }
      }, 50);
    }
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
      
      // AGGRESSIVE: Lock scroll IMMEDIATELY before anything else
      if (chatMessages) {
        preventAutoScroll = true;
        chatMessages.classList.add('prevent-scroll');
        chatMessages.scrollTop = 0;
        chatMessages.style.overflow = 'hidden';
        chatMessages.style.scrollBehavior = 'auto';
        // Lock it multiple times synchronously
        chatMessages.scrollTop = 0;
        chatMessages.scrollTop = 0;
        chatMessages.scrollTop = 0;
      }
      
      notifyParentPreventScroll();
      
      addMessage("user", opt, false);
      
      // Keep locked during API call
      if (chatMessages) {
        chatMessages.scrollTop = 0;
        chatMessages.style.overflow = 'hidden';
      }
      
      sendMessageToApi(opt);
      
      // Keep locked after API call
      setTimeout(() => {
        if (chatMessages) {
          chatMessages.scrollTop = 0;
          chatMessages.style.overflow = 'hidden';
        }
      }, 0);
    };

    bubble.appendChild(chip);
    msgDiv.appendChild(avatar);
    msgDiv.appendChild(bubble);
    chatMessages.appendChild(msgDiv);
  });

  // Don't auto-scroll when showing options - let user see the start
  // requestAnimationFrame(() => scrollToBottom());
  
  // AGGRESSIVE: Force stay at top after rendering options
  if (chatMessages && preventAutoScroll) {
    chatMessages.scrollTop = 0;
    chatMessages.style.overflow = 'hidden';
    chatMessages.classList.add('prevent-scroll');
    requestAnimationFrame(() => {
      if (chatMessages && preventAutoScroll) {
        chatMessages.scrollTop = 0;
        chatMessages.style.overflow = 'hidden';
      }
    });
    setTimeout(() => {
      if (chatMessages && preventAutoScroll) {
        chatMessages.scrollTop = 0;
        chatMessages.style.overflow = 'hidden';
      }
    }, 0);
  }
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
      // Clear any pending prompts/bubbles when switching primary via footer
      if (chatMessages) {
        const oldOptionBubbles = chatMessages.querySelectorAll(".options-bubble, .options-prompt");
        oldOptionBubbles.forEach((el) => el.remove());
      }
      if (OPTION_LINKS[opt]) {
        openExternal(OPTION_LINKS[opt]);
        return;
      }
      // AGGRESSIVE: Lock scroll IMMEDIATELY before anything else
      if (chatMessages) {
        preventAutoScroll = true;
        chatMessages.classList.add('prevent-scroll');
        chatMessages.scrollTop = 0;
        chatMessages.style.overflow = 'hidden';
        chatMessages.style.scrollBehavior = 'auto';
        // Lock it multiple times synchronously
        chatMessages.scrollTop = 0;
        chatMessages.scrollTop = 0;
        chatMessages.scrollTop = 0;
      }
      
      notifyParentPreventScroll();
      
      addMessage("user", opt, false);
      
      // Keep locked during API call
      if (chatMessages) {
        chatMessages.scrollTop = 0;
        chatMessages.style.overflow = 'hidden';
      }
      
      sendMessageToApi(opt);
      
      // Keep locked after API call
      setTimeout(() => {
        if (chatMessages) {
          chatMessages.scrollTop = 0;
          chatMessages.style.overflow = 'hidden';
        }
      }, 0);
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
