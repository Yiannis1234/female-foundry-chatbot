/**
 * SIMPLE VERSION - Uses regular buttons instead of repeater
 * 
 * SETUP INSTRUCTIONS:
 * 
 * 1. Add CSS: Go to Settings → Custom CSS → Paste WIX_CHATBOT_STYLES.css
 * 
 * 2. Element IDs you need:
 *  #chatLauncher      - small floating button (💬), pinned bottom-right
 *  #chatWindow        - main chat container box (hidden by default), pinned bottom-right
 *     Inside chatWindow, add:
 *       - Box #chatHeader (optional, for title)
 *       - Repeater #messagesRepeater (for chat bubbles)
 *         * In repeater item: add text element #messageText
 *       - Box #optionsContainer (for quick option buttons)
 *         * Inside: 4 buttons #optionButton1, #optionButton2, #optionButton3, #optionButton4
 *       - Box #inputRow (wrap input + send button)
 *         * Inside: #userInput (text input) and #sendButton (button)
 *       - #closeButton (top-right X button)
 *       - #resetButton (top-right reset button)
 * 
 * 3. Style the elements in Wix Editor:
 *    - chatWindow: width 420px, height 680px, rounded corners
 *    - messagesRepeater: fill most of the space, scrollable
 *    - inputRow: bottom of chatWindow, flex layout
 * 
 * 4. The CSS file will make everything look professional!
 */

import wixWindow from 'wix-window';
import wixFetch from 'wix-fetch';
import { local } from 'wix-storage';

const API_BASE = '/_functions';

$w.onReady(function () {
  // Apply professional styling via Velo
  applyChatbotStyles();
  
  // show launcher, hide window initially
  $w('#chatWindow').collapse();
  $w('#chatLauncher').expand();
  
  // hide all option buttons initially
  hideAllOptions();

  // open chat
  $w('#chatLauncher').onClick(() => {
    $w('#chatLauncher').collapse();
    $w('#chatWindow').expand();
    ensureSession();
  });

  // close chat
  $w('#closeButton').onClick(() => {
    $w('#chatWindow').collapse();
    $w('#chatLauncher').expand();
  });

  $w('#resetButton').onClick(() => resetSession());
  $w('#sendButton').onClick(() => handleSend());
  $w('#userInput').onKeyPress((event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      if (event.cancelable) event.preventDefault();
      handleSend();
    }
  });

  // create session when page loads
  ensureSession();
});

let currentSession = null;
let pending = false;

function applyChatbotStyles() {
  // Style launcher button
  $w('#chatLauncher').style.position = 'fixed';
  $w('#chatLauncher').style.bottom = '24px';
  $w('#chatLauncher').style.right = '24px';
  $w('#chatLauncher').style.width = '64px';
  $w('#chatLauncher').style.height = '64px';
  $w('#chatLauncher').style.borderRadius = '50%';
  $w('#chatLauncher').style.backgroundColor = '#1a1a1a';
  $w('#chatLauncher').style.color = '#ffffff';
  $w('#chatLauncher').style.border = 'none';
  $w('#chatLauncher').style.fontSize = '1.6rem';
  $w('#chatLauncher').style.boxShadow = '0 4px 16px rgba(0,0,0,0.3)';
  $w('#chatLauncher').style.zIndex = '2147483647';
  
  // Style chat window
  $w('#chatWindow').style.position = 'fixed';
  $w('#chatWindow').style.bottom = '24px';
  $w('#chatWindow').style.right = '24px';
  $w('#chatWindow').style.width = '420px';
  $w('#chatWindow').style.maxWidth = 'calc(100vw - 48px)';
  $w('#chatWindow').style.height = '680px';
  $w('#chatWindow').style.maxHeight = 'calc(100vh - 48px)';
  $w('#chatWindow').style.backgroundColor = '#ffffff';
  $w('#chatWindow').style.borderRadius = '16px';
  $w('#chatWindow').style.boxShadow = '0 8px 32px rgba(0,0,0,0.2)';
  $w('#chatWindow').style.zIndex = '2147483647';
  $w('#chatWindow').style.display = 'flex';
  $w('#chatWindow').style.flexDirection = 'column';
  $w('#chatWindow').style.overflow = 'hidden';
  
  // Style messages repeater
  $w('#messagesRepeater').style.flex = '1';
  $w('#messagesRepeater').style.overflowY = 'auto';
  $w('#messagesRepeater').style.padding = '20px';
  $w('#messagesRepeater').style.backgroundColor = '#f8f9fa';
  $w('#messagesRepeater').style.display = 'flex';
  $w('#messagesRepeater').style.flexDirection = 'column';
  $w('#messagesRepeater').style.gap = '12px';
  
  // Style options container
  $w('#optionsContainer').style.padding = '12px 20px';
  $w('#optionsContainer').style.backgroundColor = '#ffffff';
  $w('#optionsContainer').style.borderTop = '1px solid #e0e0e0';
  $w('#optionsContainer').style.display = 'flex';
  $w('#optionsContainer').style.flexDirection = 'column';
  $w('#optionsContainer').style.gap = '8px';
  
  // Style option buttons
  ['#optionButton1', '#optionButton2', '#optionButton3', '#optionButton4'].forEach(id => {
    try {
      $w(id).style.width = '100%';
      $w(id).style.padding = '12px 16px';
      $w(id).style.backgroundColor = '#f5f5f5';
      $w(id).style.color = '#1a1a1a';
      $w(id).style.border = '1px solid #e0e0e0';
      $w(id).style.borderRadius = '12px';
      $w(id).style.fontSize = '14px';
      $w(id).style.textAlign = 'left';
      $w(id).style.fontWeight = '500';
    } catch (e) {
      // Element might not exist yet
    }
  });
  
  // Style input
  $w('#userInput').style.padding = '12px 16px';
  $w('#userInput').style.border = '1px solid #e0e0e0';
  $w('#userInput').style.borderRadius = '24px';
  $w('#userInput').style.fontSize = '14px';
  $w('#userInput').style.backgroundColor = '#ffffff';
  
  // Style send button
  $w('#sendButton').style.width = '48px';
  $w('#sendButton').style.height = '48px';
  $w('#sendButton').style.borderRadius = '50%';
  $w('#sendButton').style.backgroundColor = '#1a1a1a';
  $w('#sendButton').style.color = '#ffffff';
  $w('#sendButton').style.border = 'none';
  $w('#sendButton').style.fontSize = '20px';
  
  // Style close button
  $w('#closeButton').style.position = 'absolute';
  $w('#closeButton').style.top = '16px';
  $w('#closeButton').style.right = '16px';
  $w('#closeButton').style.width = '32px';
  $w('#closeButton').style.height = '32px';
  $w('#closeButton').style.borderRadius = '50%';
  $w('#closeButton').style.backgroundColor = 'rgba(255,255,255,0.2)';
  $w('#closeButton').style.color = '#ffffff';
  $w('#closeButton').style.border = 'none';
  $w('#closeButton').style.fontSize = '18px';
  
  // Style reset button
  $w('#resetButton').style.position = 'absolute';
  $w('#resetButton').style.top = '16px';
  $w('#resetButton').style.right = '56px';
  $w('#resetButton').style.padding = '6px 12px';
  $w('#resetButton').style.backgroundColor = 'rgba(255,255,255,0.2)';
  $w('#resetButton').style.color = '#ffffff';
  $w('#resetButton').style.border = 'none';
  $w('#resetButton').style.borderRadius = '16px';
  $w('#resetButton').style.fontSize = '12px';
  
  // Style input row if it exists
  try {
    $w('#inputRow').style.display = 'flex';
    $w('#inputRow').style.gap = '8px';
    $w('#inputRow').style.padding = '16px 20px';
    $w('#inputRow').style.backgroundColor = '#ffffff';
    $w('#inputRow').style.borderTop = '1px solid #e0e0e0';
  } catch (e) {
    // inputRow might not exist
  }
}

function hideAllOptions() {
  $w('#optionButton1').collapse();
  $w('#optionButton2').collapse();
  $w('#optionButton3').collapse();
  $w('#optionButton4').collapse();
}

async function ensureSession() {
  if (currentSession) {
    return;
  }
  try {
    const stored = local.getItem('chatSessionId');
    if (stored) {
      currentSession = stored;
      await fetchInitialState(stored);
      return;
    }
    await startNewSession();
  } catch (err) {
    showSystemMessage('Unable to start chat. Please try again in a moment.');
    console.error('ensureSession error', err);
  }
}

async function startNewSession() {
  const res = await wixFetch.fetch(`${API_BASE}/session`, {
    method: 'POST'
  });
  if (!res.ok) {
    throw new Error(`Session error: ${res.status}`);
  }
  const data = await res.json();
  currentSession = data.session_id;
  local.setItem('chatSessionId', currentSession);
  updateUIFromPayload(data);
}

async function fetchInitialState(sessionId) {
  // optional: call reset endpoint to get last state, or just start new
  await startNewSession();
}

async function resetSession() {
  if (!currentSession) {
    return;
  }
  const res = await wixFetch.fetch(`${API_BASE}/session/${currentSession}/reset`, {
    method: 'POST'
  });
  if (!res.ok) {
    showSystemMessage('Unable to reset right now.');
    return;
  }
  const data = await res.json();
  updateUIFromPayload(data);
}

async function handleSend() {
  if (pending) {
    return;
  }
  const text = ($w('#userInput').value || '').trim();
  if (!text) {
    return;
  }
  appendMessage('user', text);
  $w('#userInput').value = '';
  await sendMessage(text);
}

async function sendMessage(text) {
  if (!currentSession) {
    await ensureSession();
  }
  pending = true;
  try {
    const res = await wixFetch.fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: currentSession,
        message: text
      })
    });
    if (!res.ok) {
      throw new Error(`Chat error: ${res.status}`);
    }
    const data = await res.json();
    updateUIFromPayload(data);
  } catch (err) {
    console.error('sendMessage error', err);
    showSystemMessage('Something went wrong. Please try again.');
  } finally {
    pending = false;
  }
}

function updateUIFromPayload(payload) {
  const msgs = payload.messages || [];
  const options = payload.options || [];
  if (payload.session_id) {
    currentSession = payload.session_id;
    local.setItem('chatSessionId', currentSession);
  }
  renderMessages(msgs);
  renderOptions(options);
}

function renderMessages(messages) {
  const items = messages.map((msg, idx) => ({
    _id: `${idx}-${msg.role}-${Date.now()}`,
    text: msg.content,
    role: msg.role
  }));
  $w('#messagesRepeater').data = items;
  $w('#messagesRepeater').onItemReady(($item, itemData) => {
    $item('#messageText').text = itemData.text;
    
    // Style message bubbles
    if (itemData.role === 'user') {
      // User messages: dark, right-aligned
      $item('#messageText').style.color = '#ffffff';
      $item('#messageText').style.backgroundColor = '#1a1a1a';
      $item('#messageText').style.marginLeft = 'auto';
      $item('#messageText').style.marginRight = '0';
      $item('#messageText').style.borderBottomRightRadius = '4px';
    } else {
      // Bot messages: light, left-aligned
      $item('#messageText').style.color = '#1a1a1a';
      $item('#messageText').style.backgroundColor = '#ffffff';
      $item('#messageText').style.marginLeft = '0';
      $item('#messageText').style.marginRight = 'auto';
      $item('#messageText').style.borderBottomLeftRadius = '4px';
      $item('#messageText').style.border = '1px solid #e0e0e0';
    }
    
    // Common bubble styles
    $item('#messageText').style.padding = '12px 16px';
    $item('#messageText').style.borderRadius = '18px';
    $item('#messageText').style.maxWidth = '75%';
    $item('#messageText').style.wordWrap = 'break-word';
    $item('#messageText').style.fontSize = '14px';
    $item('#messageText').style.lineHeight = '1.5';
    $item('#messageText').style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
  });
  // scroll to bottom
  wixWindow.getBoundingRect().then(() => {
    $w('#messagesRepeater').scrollToIndex(items.length - 1);
  });
}

function appendMessage(role, text) {
  const data = $w('#messagesRepeater').data || [];
  data.push({
    _id: `${Date.now()}-${role}`,
    text,
    role
  });
  $w('#messagesRepeater').data = data;
  $w('#messagesRepeater').onItemReady(($item, itemData) => {
    $item('#messageText').text = itemData.text;
    
    // Style message bubbles (same as renderMessages)
    if (itemData.role === 'user') {
      $item('#messageText').style.color = '#ffffff';
      $item('#messageText').style.backgroundColor = '#1a1a1a';
      $item('#messageText').style.marginLeft = 'auto';
      $item('#messageText').style.marginRight = '0';
      $item('#messageText').style.borderBottomRightRadius = '4px';
    } else {
      $item('#messageText').style.color = '#1a1a1a';
      $item('#messageText').style.backgroundColor = '#ffffff';
      $item('#messageText').style.marginLeft = '0';
      $item('#messageText').style.marginRight = 'auto';
      $item('#messageText').style.borderBottomLeftRadius = '4px';
      $item('#messageText').style.border = '1px solid #e0e0e0';
    }
    
    $item('#messageText').style.padding = '12px 16px';
    $item('#messageText').style.borderRadius = '18px';
    $item('#messageText').style.maxWidth = '75%';
    $item('#messageText').style.wordWrap = 'break-word';
    $item('#messageText').style.fontSize = '14px';
    $item('#messageText').style.lineHeight = '1.5';
    $item('#messageText').style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
  });
}

function renderOptions(options) {
  if (!options.length) {
    $w('#optionsContainer').collapse();
    hideAllOptions();
    return;
  }
  
  // Show the container
  $w('#optionsContainer').expand();
  
  // Show and populate buttons (max 4)
  const buttons = [
    $w('#optionButton1'),
    $w('#optionButton2'),
    $w('#optionButton3'),
    $w('#optionButton4')
  ];
  
  // Hide all first
  hideAllOptions();
  
  // Show and set labels for available options
  for (let i = 0; i < Math.min(options.length, 4); i++) {
    buttons[i].expand();
    buttons[i].label = options[i];
    buttons[i].onClick(() => sendMessage(options[i]));
  }
}

function showSystemMessage(text) {
  appendMessage('bot', text);
}

