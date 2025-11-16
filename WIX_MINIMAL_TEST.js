/**
 * MINIMAL TEST VERSION - Just the essentials to test if it works
 * 
 * Elements you need:
 * 1. Button → ID: chatLauncher (floating button, bottom-right)
 * 2. Box → ID: chatWindow (main chat container, hidden by default)
 *    Inside chatWindow:
 *      - Repeater → ID: messagesRepeater
 *        * Inside repeater item: Text element → ID: messageText
 *      - Text Input → ID: userInput
 *      - Button → ID: sendButton
 *      - Button → ID: closeButton
 * 
 * That's it! No option buttons, no reset button - just chat.
 */

import wixWindow from 'wix-window';
import wixFetch from 'wix-fetch';
import { local } from 'wix-storage';

const API_BASE = '/_functions';

$w.onReady(function () {
  // Apply basic styling
  applyBasicStyles();
  
  // Hide chat window, show launcher
  $w('#chatWindow').collapse();
  $w('#chatLauncher').expand();

  // Open chat
  $w('#chatLauncher').onClick(() => {
    $w('#chatLauncher').collapse();
    $w('#chatWindow').expand();
    ensureSession();
  });

  // Close chat
  $w('#closeButton').onClick(() => {
    $w('#chatWindow').collapse();
    $w('#chatLauncher').expand();
  });

  // Send message
  $w('#sendButton').onClick(() => handleSend());
  $w('#userInput').onKeyPress((event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      if (event.cancelable) event.preventDefault();
      handleSend();
    }
  });

  // Start session
  ensureSession();
});

let currentSession = null;
let pending = false;

function applyBasicStyles() {
  // Launcher button
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
  
  // Chat window
  $w('#chatWindow').style.position = 'fixed';
  $w('#chatWindow').style.bottom = '24px';
  $w('#chatWindow').style.right = '24px';
  $w('#chatWindow').style.width = '420px';
  $w('#chatWindow').style.height = '680px';
  $w('#chatWindow').style.backgroundColor = '#ffffff';
  $w('#chatWindow').style.borderRadius = '16px';
  $w('#chatWindow').style.boxShadow = '0 8px 32px rgba(0,0,0,0.2)';
  $w('#chatWindow').style.zIndex = '2147483647';
  $w('#chatWindow').style.display = 'flex';
  $w('#chatWindow').style.flexDirection = 'column';
  
  // Messages repeater
  $w('#messagesRepeater').style.flex = '1';
  $w('#messagesRepeater').style.overflowY = 'auto';
  $w('#messagesRepeater').style.padding = '20px';
  $w('#messagesRepeater').style.backgroundColor = '#f8f9fa';
  
  // Input
  $w('#userInput').style.padding = '12px 16px';
  $w('#userInput').style.border = '1px solid #e0e0e0';
  $w('#userInput').style.borderRadius = '24px';
  $w('#userInput').style.fontSize = '14px';
  
  // Send button
  $w('#sendButton').style.width = '48px';
  $w('#sendButton').style.height = '48px';
  $w('#sendButton').style.borderRadius = '50%';
  $w('#sendButton').style.backgroundColor = '#1a1a1a';
  $w('#sendButton').style.color = '#ffffff';
  $w('#sendButton').style.border = 'none';
  
  // Close button
  $w('#closeButton').style.position = 'absolute';
  $w('#closeButton').style.top = '16px';
  $w('#closeButton').style.right = '16px';
  $w('#closeButton').style.width = '32px';
  $w('#closeButton').style.height = '32px';
  $w('#closeButton').style.borderRadius = '50%';
  $w('#closeButton').style.backgroundColor = '#e0e0e0';
  $w('#closeButton').style.border = 'none';
}

async function ensureSession() {
  if (currentSession) {
    return;
  }
  try {
    const stored = local.getItem('chatSessionId');
    if (stored) {
      currentSession = stored;
      await startNewSession(); // Just start fresh for testing
      return;
    }
    await startNewSession();
  } catch (err) {
    showSystemMessage('Unable to start chat. Please check backend.');
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
    showSystemMessage('Error: ' + err.message + '. Check backend.');
  } finally {
    pending = false;
  }
}

function updateUIFromPayload(payload) {
  const msgs = payload.messages || [];
  if (payload.session_id) {
    currentSession = payload.session_id;
    local.setItem('chatSessionId', currentSession);
  }
  renderMessages(msgs);
  // Skip options for minimal version
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
    
    // Style bubbles
    if (itemData.role === 'user') {
      $item('#messageText').style.color = '#ffffff';
      $item('#messageText').style.backgroundColor = '#1a1a1a';
      $item('#messageText').style.marginLeft = 'auto';
      $item('#messageText').style.marginRight = '0';
    } else {
      $item('#messageText').style.color = '#1a1a1a';
      $item('#messageText').style.backgroundColor = '#ffffff';
      $item('#messageText').style.marginLeft = '0';
      $item('#messageText').style.marginRight = 'auto';
      $item('#messageText').style.border = '1px solid #e0e0e0';
    }
    
    $item('#messageText').style.padding = '12px 16px';
    $item('#messageText').style.borderRadius = '18px';
    $item('#messageText').style.maxWidth = '75%';
    $item('#messageText').style.fontSize = '14px';
    $item('#messageText').style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
  });
  
  // Scroll to bottom
  setTimeout(() => {
    try {
      $w('#messagesRepeater').scrollToIndex(items.length - 1);
    } catch (e) {
      // Ignore scroll errors
    }
  }, 100);
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
    
    if (itemData.role === 'user') {
      $item('#messageText').style.color = '#ffffff';
      $item('#messageText').style.backgroundColor = '#1a1a1a';
      $item('#messageText').style.marginLeft = 'auto';
      $item('#messageText').style.marginRight = '0';
    } else {
      $item('#messageText').style.color = '#1a1a1a';
      $item('#messageText').style.backgroundColor = '#ffffff';
      $item('#messageText').style.marginLeft = '0';
      $item('#messageText').style.marginRight = 'auto';
      $item('#messageText').style.border = '1px solid #e0e0e0';
    }
    
    $item('#messageText').style.padding = '12px 16px';
    $item('#messageText').style.borderRadius = '18px';
    $item('#messageText').style.maxWidth = '75%';
    $item('#messageText').style.fontSize = '14px';
    $item('#messageText').style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
  });
}

function showSystemMessage(text) {
  appendMessage('bot', text);
}

