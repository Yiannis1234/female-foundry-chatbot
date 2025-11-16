import wixFetch from 'wix-fetch';

const API_BASE = '/_functions';
const OPTION_BUTTON_IDS = ['#optionButton1', '#optionButton2', '#optionButton3'];

let currentSession = null;
let pending = false;
let cachedMessages = [];

$w.onReady(() => {
  initializeLayout();
  attachEvents();
  startSession();
});

function initializeLayout() {
  $w('#chatWindow').collapse();
  OPTION_BUTTON_IDS.forEach((id) => $w(id).collapse());
  $w('#optionsContainer').collapse();
}

function attachEvents() {
  $w('#chatLauncher').onClick(() => {
    $w('#chatLauncher').collapse();
    $w('#chatWindow').expand();
    $w('#userInput').focus();
  });

  $w('#closeButton').onClick(() => {
    $w('#chatWindow').collapse();
    $w('#chatLauncher').expand();
  });

  $w('#sendButton').onClick(handleSend);

  $w('#userInput').onKeyPress((event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      if (event.cancelable) {
        event.preventDefault();
      }
      handleSend();
    }
  });
}

async function startSession() {
  pending = true;
  try {
    const response = await wixFetch.fetch(`${API_BASE}/session`, { method: 'POST' });
    const data = await response.json();
    currentSession = data.session_id;
    updateUIFromPayload(data);
  } catch (error) {
    showSystemMessage('Unable to start the chat. Please refresh the page.');
  } finally {
    pending = false;
  }
}

async function handleSend() {
  const text = ($w('#userInput').value || '').trim();
  if (!text || pending) {
    return;
  }

  if (!currentSession) {
    await startSession();
  }

  pending = true;
  $w('#sendButton').label = 'Sending...';

  try {
    const response = await wixFetch.fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: currentSession,
        message: text,
      }),
    });

    if (!response.ok) {
      throw new Error('Server error');
    }

    const data = await response.json();
    currentSession = data.session_id;
    $w('#userInput').value = '';
    updateUIFromPayload(data);
  } catch (error) {
    showSystemMessage('Something went wrong. Please try again in a moment.');
  } finally {
    pending = false;
    $w('#sendButton').label = 'Send';
  }
}

function updateUIFromPayload(payload) {
  cachedMessages = payload.messages || [];
  renderMessages(cachedMessages);
  renderOptions(payload.options || []);
}

function renderMessages(messages) {
  const items = messages.map((msg, index) => ({
    _id: `${index}-${msg.role}`,
    role: msg.role,
    content: msg.content,
  }));

  $w('#messagesRepeater').data = items;
  $w('#messagesRepeater').onItemReady(($item, itemData) => {
    if (itemData.role === 'user') {
      $item('#userBubble').expand();
      $item('#userText').text = itemData.content;
      $item('#botBubble').collapse();
    } else {
      $item('#botBubble').expand();
      $item('#botText').text = itemData.content;
      $item('#userBubble').collapse();
    }
  });

  setTimeout(() => {
    try {
      $w('#messagesRepeater').scrollToIndex(items.length - 1);
    } catch (error) {
      // ignore scroll issues
    }
  }, 150);
}

function renderOptions(options) {
  if (!options || !options.length) {
    $w('#optionsContainer').collapse();
    OPTION_BUTTON_IDS.forEach((id) => $w(id).collapse());
    return;
  }

  $w('#optionsContainer').expand();
  OPTION_BUTTON_IDS.forEach((id, index) => {
    const button = $w(id);
    if (options[index]) {
      button.label = options[index];
      button.expand();
      button.onClick(() => handleQuickOption(options[index]));
    } else {
      button.collapse();
    }
  });
}

function handleQuickOption(optionText) {
  if (pending) {
    return;
  }
  $w('#userInput').value = optionText;
  handleSend();
}

function showSystemMessage(text) {
  cachedMessages = [...cachedMessages, { role: 'bot', content: text }];
  renderMessages(cachedMessages);
}

