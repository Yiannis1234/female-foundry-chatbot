const API_BASE = "/api";

const chatPopup = document.getElementById("chatPopup");
const toggleBtn = document.getElementById("chatToggle");
const messagesEl = document.getElementById("chatMessages");
const optionsEl = document.getElementById("chatOptions");
const inputEl = document.getElementById("chatInput");
const sendBtn = document.getElementById("chatSend");
const resetBtn = document.getElementById("chatReset");
const closeBtn = document.getElementById("chatClose");

let sessionId = null;
let isSending = false;
let typingMessageEl = null;
let typingStartTime = null;
const MIN_TYPING_DISPLAY_TIME = 1000; // Minimum 1 second to see typing indicator

function ensureMessageVisible(node) {
  if (!node || !messagesEl) return;
  // Wait for DOM to fully render, then scroll to show message at top
  setTimeout(() => {
    // Get the message position relative to the scroll container
    const messageRect = node.getBoundingClientRect();
    const containerRect = messagesEl.getBoundingClientRect();
    const messageTop = node.offsetTop;
    const containerPadding = 20;
    
    // Calculate scroll position to show message at top of visible area
    const targetScroll = messageTop - containerPadding;
    
    // Scroll to show the message
    messagesEl.scrollTop = targetScroll;
    
    // Double-check after a brief delay to ensure it's visible
    setTimeout(() => {
      const currentMessageTop = node.getBoundingClientRect().top;
      const currentContainerTop = messagesEl.getBoundingClientRect().top;
      // If message is not visible at top, scroll again
      if (currentMessageTop > currentContainerTop + 30) {
        messagesEl.scrollTop = node.offsetTop - containerPadding;
      }
    }, 100);
  }, 100);
}

function scrollToBottom() {
  if (!messagesEl) return;
  // Use multiple attempts to ensure we scroll to the very bottom
  setTimeout(() => {
    messagesEl.scrollTop = messagesEl.scrollHeight;
    // Double-check after a brief delay to ensure we're at the bottom
    setTimeout(() => {
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }, 50);
  }, 50);
}

function createMessageShell(role) {
  const wrapper = document.createElement("div");
  wrapper.className = `chat-message ${role}`;

  const avatar = document.createElement("div");
  avatar.className = `avatar ${role}`;
  avatar.textContent = role === "bot" ? "FF" : "You";
  wrapper.appendChild(avatar);

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  wrapper.appendChild(bubble);

  return { wrapper, bubble };
}

function showTypingIndicator() {
  // Remove any existing typing indicator first
  if (typingMessageEl) {
    typingMessageEl.remove();
    typingMessageEl = null;
  }
  
  const { wrapper, bubble } = createMessageShell("bot");
  wrapper.classList.add("typing");
  bubble.innerHTML =
    '<span class="typing-dots"><span></span><span></span><span></span></span>';
  typingMessageEl = wrapper;
  messagesEl.appendChild(wrapper);
  typingStartTime = Date.now();
  
  // Force visibility and scroll to show it
  requestAnimationFrame(() => {
    wrapper.style.display = "flex";
    wrapper.style.opacity = "1";
    scrollToBottom();
  });
}

function hideTypingIndicator(callback) {
  if (!typingMessageEl) {
    if (callback) callback();
    return;
  }
  
  // Ensure typing indicator is visible for minimum time
  const elapsed = typingStartTime ? Date.now() - typingStartTime : 0;
  const remainingTime = Math.max(0, MIN_TYPING_DISPLAY_TIME - elapsed);
  
  setTimeout(() => {
    if (typingMessageEl) {
      typingMessageEl.remove();
      typingMessageEl = null;
      typingStartTime = null;
    }
    if (callback) callback();
  }, remainingTime);
}

function updatePlaceholder(stage) {
  if (stage === "ask_name") {
    inputEl.placeholder = "Type your name…";
  } else {
    inputEl.placeholder = "Ask about programs, stats, etc.";
  }
}

async function createSession() {
  const res = await fetch(`${API_BASE}/session`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to create session");
  const data = await res.json();
  sessionId = data.session_id;
  clearMessages();
  hideTypingIndicator();
  appendMessages(data.messages || []);
  renderOptions(data.options || []);
  updatePlaceholder(data.stage);
  openChat();
  inputEl.focus();
}

async function resetSession() {
  if (!sessionId) return;
  const res = await fetch(`${API_BASE}/session/${sessionId}/reset`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to reset session");
  const data = await res.json();
  clearMessages();
  hideTypingIndicator();
  appendMessages(data.messages || []);
  renderOptions(data.options || []);
  updatePlaceholder(data.stage);
  inputEl.focus();
}

async function sendMessage(text) {
  if (!sessionId || isSending) return;
  const trimmed = text.trim();
  if (!trimmed) return;

  addMessage("user", trimmed);
  renderOptions([]);
  inputEl.value = "";
  inputEl.focus();

  isSending = true;
  showTypingIndicator();
  try {
    const res = await fetch(`${API_BASE}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId, message: trimmed }),
    });
    if (!res.ok) throw new Error("Chat request failed");
    const data = await res.json();
    
    // Hide typing indicator (with minimum display time), then show messages
    hideTypingIndicator(() => {
      appendMessages(data.messages || []);
      renderOptions(data.options || []);
      updatePlaceholder(data.stage);
    });
  } catch (err) {
    console.error(err);
    hideTypingIndicator();
    addMessage("bot", "Something went wrong. Try again in a moment.");
  } finally {
    isSending = false;
  }
}

function appendMessages(messages) {
  messages.forEach((msg) => addMessage(msg.role, msg.content));
}

function addMessage(role, content) {
  const { wrapper, bubble } = createMessageShell(role);
  if (role === "bot") {
    bubble.innerHTML = content;
  } else {
    bubble.textContent = content;
  }
  messagesEl.appendChild(wrapper);
  
  // For both user and bot messages, scroll to bottom so they're always visible
  // This ensures messages appear at the bottom of visible area, not requiring scroll up
  setTimeout(() => {
    scrollToBottom();
  }, 100);
}

function renderOptions(options) {
  optionsEl.innerHTML = "";
  if (!options || !options.length) return;
  options.forEach((opt) => {
    const btn = document.createElement("button");
    btn.className = "option-pill";
    btn.type = "button";
    btn.textContent = opt;
    btn.addEventListener("click", () => sendMessage(opt));
    optionsEl.appendChild(btn);
  });
}

function clearMessages() {
  messagesEl.innerHTML = "";
  optionsEl.innerHTML = "";
  typingMessageEl = null;
}

function openChat() {
  chatPopup.classList.remove("hidden");
  toggleBtn.classList.remove("visible");
}

function hideChat() {
  chatPopup.classList.add("hidden");
  toggleBtn.classList.add("visible");
}

function handleSendClick() {
  const value = inputEl.value;
  sendMessage(value);
}

sendBtn.addEventListener("click", handleSendClick);
inputEl.addEventListener("keydown", (evt) => {
  if (evt.key === "Enter" && !evt.shiftKey) {
    evt.preventDefault();
    handleSendClick();
  }
});
resetBtn.addEventListener("click", () => {
  resetSession().catch((err) => console.error(err));
});
closeBtn.addEventListener("click", hideChat);
toggleBtn.addEventListener("click", () => {
  openChat();
  inputEl.focus();
});

window.addEventListener("load", () => {
  createSession().catch((err) => {
    console.error(err);
    addMessage("bot", "Unable to start the session. Refresh the page to try again.");
  });
});
