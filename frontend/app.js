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

function scrollToShowMessage(node) {
  if (!node || !messagesEl) return;
  // Wait for DOM to update, then scroll to show the message at the top
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      // Get the position of the message relative to the scroll container
      const messageTop = node.offsetTop;
      const containerPadding = 20; // Padding from top
      // Scroll so the message appears at the top of visible area
      messagesEl.scrollTop = messageTop - containerPadding;
    });
  });
}

function scrollToBottom() {
  if (!messagesEl) return;
  requestAnimationFrame(() => {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  });
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
  if (typingMessageEl) {
    // Make sure it's visible
    typingMessageEl.style.display = "flex";
    return;
  }
  const { wrapper, bubble } = createMessageShell("bot");
  wrapper.classList.add("typing");
  bubble.innerHTML =
    '<span class="typing-dots"><span></span><span></span><span></span></span>';
  typingMessageEl = wrapper;
  messagesEl.appendChild(wrapper);
  // Scroll to show typing indicator
  scrollToBottom();
}

function hideTypingIndicator() {
  if (!typingMessageEl) return;
  typingMessageEl.remove();
  typingMessageEl = null;
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
    hideTypingIndicator();
    // Small delay to ensure typing indicator is removed before adding messages
    setTimeout(() => {
      appendMessages(data.messages || []);
      renderOptions(data.options || []);
      updatePlaceholder(data.stage);
    }, 100);
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
  // For bot messages, scroll to show the top of the message
  // For user messages, just scroll to bottom
  if (role === "bot") {
    scrollToShowMessage(wrapper);
  } else {
    scrollToBottom();
  }
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
