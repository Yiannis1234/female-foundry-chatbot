// Complete Wix Velo Page Code - Chatbot Embedded (No External Hosting)
// Replace ALL your page code with this

$w.onReady(function () {

    // Start counter when the element enters the viewport
    $w("#text1833").onViewportEnter(() => {
        animateNumberCounter("#text1833", 144990, 145038, 1200);
    });

    // Initialize chatbot after page loads
    setTimeout(() => {
        initChatbot();
    }, 1000);
});

// Function for easing effect: slows down in the last 30% of counting
function easeOutExpo(t, b, c, d) {
    if (t < 0.7 * d) {
        return b + (c * (t / d));
    } else {
        return b + c * (1 - Math.pow(2, -10 * (t - 0.7 * d) / (0.3 * d)));
    }
}

// Function to animate number counter smoothly
function animateNumberCounter(elementId, start, end, duration) {
    let startTime = Date.now();
    const change = end - start;
    const counterInterval = setInterval(() => {
        let elapsedTime = Date.now() - startTime;
        if (elapsedTime < duration) {
            const easedValue = easeOutExpo(elapsedTime, start, change, duration);
            $w(elementId).text = `${Math.round(easedValue).toLocaleString()}`;
        } else {
            clearInterval(counterInterval);
            $w(elementId).text = `${end.toLocaleString()}`;
        }
    }, 10);
}

// ============================================
// CHATBOT CODE - Embedded in Wix
// ============================================

function initChatbot() {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
        setTimeout(initChatbot, 500);
        return;
    }

    if (document.getElementById('ff-chatbot-launcher')) {
        return; // Already initialized
    }

    if (!document.body) {
        setTimeout(initChatbot, 200);
        return;
    }

    // Inject CSS
    injectChatbotCSS();

    // Create chatbot HTML structure
    const chatbotHTML = `
        <button id="ff-chatbot-launcher" aria-label="Open chat">💬</button>
        <div id="ff-chatbot-popup" class="ff-chatbot-hidden">
            <div class="ff-chatbot-card">
                <div class="ff-chatbot-header">
                    <div class="ff-chatbot-title">
                        <span class="ff-chatbot-dot"></span>
                        Female Foundry
                    </div>
                    <div class="ff-chatbot-actions">
                        <button class="ff-chatbot-ghost-btn" id="ff-chatbot-reset" title="Start over">↺</button>
                        <button class="ff-chatbot-ghost-btn" id="ff-chatbot-close" title="Hide">✖</button>
                    </div>
                </div>
                <div class="ff-chatbot-scroll" id="ff-chatbot-messages"></div>
                <div class="ff-chatbot-options" id="ff-chatbot-options"></div>
                <div class="ff-chatbot-input-bar">
                    <input type="text" id="ff-chatbot-input" placeholder="Type your question…" autocomplete="off" />
                    <button class="ff-chatbot-send-btn" id="ff-chatbot-send">Send</button>
                </div>
                <nav class="ff-chatbot-footer-links">
                    <a href="https://www.femalefoundry.co/" target="_blank" rel="noopener">Website</a>
                    <span>•</span>
                    <a href="https://www.femalefoundry.co/#programs" target="_blank" rel="noopener">Programs</a>
                    <span>•</span>
                    <a href="mailto:HELLO@FEMALEFOUNDRY.CO">Contact</a>
                </nav>
            </div>
        </div>
    `;

    // Create container and inject HTML
    const container = document.createElement('div');
    container.innerHTML = chatbotHTML;
    document.body.appendChild(container);

    // Initialize chatbot functionality
    initChatbotLogic();
}

function injectChatbotCSS() {
    const style = document.createElement('style');
    style.textContent = `
        /* Chatbot Styles */
        #ff-chatbot-launcher {
            position: fixed;
            bottom: 24px;
            right: 24px;
            width: 64px;
            height: 64px;
            border-radius: 50%;
            background: #1a1a1a;
            color: #ffffff;
            border: none;
            font-size: 1.6rem;
            cursor: pointer;
            z-index: 999998;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
            transition: transform 0.2s, box-shadow 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        #ff-chatbot-launcher:hover {
            transform: scale(1.05);
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
        }
        #ff-chatbot-popup {
            position: fixed;
            right: 24px;
            bottom: 24px;
            z-index: 999999;
            transition: transform 0.25s ease, opacity 0.25s ease;
        }
        #ff-chatbot-popup.ff-chatbot-hidden {
            transform: translateY(18px) scale(0.97);
            opacity: 0;
            pointer-events: none;
        }
        .ff-chatbot-card {
            width: 420px;
            max-height: 680px;
            background: #ffffff;
            border-radius: 16px;
            border: 1px solid #e0e0e0;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
            overflow: hidden;
            display: flex;
            flex-direction: column;
        }
        .ff-chatbot-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 1rem 1.25rem;
            background: #1a1a1a;
            border-bottom: 1px solid #333;
        }
        .ff-chatbot-title {
            display: flex;
            align-items: center;
            gap: 10px;
            font-weight: 700;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            color: #ffffff;
            font-size: 0.85rem;
        }
        .ff-chatbot-dot {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: #ff0000;
            display: inline-block;
            animation: ff-pulse 2s infinite;
        }
        @keyframes ff-pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
        .ff-chatbot-actions {
            display: flex;
            gap: 6px;
        }
        .ff-chatbot-ghost-btn {
            width: 32px;
            height: 32px;
            border: none;
            border-radius: 8px;
            background: rgba(255, 255, 255, 0.1);
            color: #ffffff;
            font-size: 1rem;
            cursor: pointer;
            transition: background 0.2s;
        }
        .ff-chatbot-ghost-btn:hover {
            background: rgba(255, 255, 255, 0.2);
        }
        .ff-chatbot-scroll {
            max-height: 420px;
            overflow-y: auto;
            padding: 1.25rem;
            display: flex;
            flex-direction: column;
            gap: 0.85rem;
            background: #ffffff;
        }
        .ff-chatbot-message {
            display: flex;
            align-items: flex-start;
            gap: 12px;
        }
        .ff-chatbot-message.ff-chatbot-user {
            justify-content: flex-end;
        }
        .ff-chatbot-bubble {
            padding: 0.85rem 1.1rem;
            border-radius: 14px;
            font-size: 0.95rem;
            line-height: 1.6rem;
            max-width: 300px;
            word-break: break-word;
        }
        .ff-chatbot-message.ff-chatbot-bot .ff-chatbot-bubble {
            background: #f5f5f5;
            border: 1px solid #e0e0e0;
            color: #1a1a1a;
        }
        .ff-chatbot-message.ff-chatbot-user .ff-chatbot-bubble {
            background: #1a1a1a;
            color: #ffffff;
            border: none;
        }
        .ff-chatbot-options {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            padding: 0 1.1rem 0.55rem;
        }
        .ff-chatbot-option-pill {
            padding: 10px 16px;
            border-radius: 20px;
            background: #ffffff;
            border: 2px solid #1a1a1a;
            color: #1a1a1a;
            font-size: 0.87rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
        }
        .ff-chatbot-option-pill:hover {
            background: #1a1a1a;
            color: #ffffff;
            transform: translateY(-1px);
        }
        .ff-chatbot-input-bar {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 1rem 1.25rem;
            background: #fafafa;
            border-top: 1px solid #e0e0e0;
        }
        #ff-chatbot-input {
            flex: 1;
            border: 2px solid #e0e0e0;
            border-radius: 12px;
            padding: 0.8rem 1rem;
            font-size: 0.95rem;
            color: #1a1a1a;
            background: #ffffff;
        }
        #ff-chatbot-input:focus {
            outline: none;
            border-color: #ff0000;
        }
        .ff-chatbot-send-btn {
            border: none;
            border-radius: 12px;
            background: #1a1a1a;
            color: #ffffff;
            font-weight: 600;
            padding: 0.8rem 1.4rem;
            cursor: pointer;
        }
        .ff-chatbot-send-btn:hover {
            background: #333333;
        }
        .ff-chatbot-footer-links {
            padding: 0.9rem 1.25rem 1rem;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            font-size: 0.8rem;
            color: #666666;
            background: #fafafa;
            border-top: 1px solid #e0e0e0;
        }
        .ff-chatbot-footer-links a {
            color: #1a1a1a;
            font-weight: 600;
            text-decoration: none;
        }
        .ff-chatbot-footer-links a:hover {
            color: #ff0000;
            text-decoration: underline;
        }
        @media (max-width: 768px) {
            .ff-chatbot-card {
                width: calc(100vw - 32px);
                max-width: 420px;
            }
            #ff-chatbot-popup {
                right: 16px;
                bottom: 16px;
            }
            #ff-chatbot-launcher {
                right: 16px;
                bottom: 16px;
            }
        }
    `;
    document.head.appendChild(style);
}

function initChatbotLogic() {
    const API_BASE = '/_functions';
    let sessionId = null;
    let isSending = false;

    const launcher = document.getElementById('ff-chatbot-launcher');
    const popup = document.getElementById('ff-chatbot-popup');
    const closeBtn = document.getElementById('ff-chatbot-close');
    const resetBtn = document.getElementById('ff-chatbot-reset');
    const messagesEl = document.getElementById('ff-chatbot-messages');
    const optionsEl = document.getElementById('ff-chatbot-options');
    const inputEl = document.getElementById('ff-chatbot-input');
    const sendBtn = document.getElementById('ff-chatbot-send');

    // Toggle chat
    launcher.addEventListener('click', () => {
        popup.classList.remove('ff-chatbot-hidden');
        launcher.style.display = 'none';
        inputEl.focus();
    });

    closeBtn.addEventListener('click', () => {
        popup.classList.add('ff-chatbot-hidden');
        launcher.style.display = 'flex';
    });

    // Create session
    async function createSession() {
        try {
            const res = await fetch(`${API_BASE}/createSession`, { method: 'POST' });
            const data = await res.json();
            sessionId = data.session_id;
            clearMessages();
            appendMessages(data.messages || []);
            renderOptions(data.options || []);
            updatePlaceholder(data.stage);
        } catch (err) {
            console.error(err);
            addMessage('bot', 'Unable to start the session. Refresh the page to try again.');
        }
    }

    // Reset session
    async function resetSession() {
        if (!sessionId) return;
        try {
            const res = await fetch(`${API_BASE}/resetSession/${sessionId}`, { method: 'POST' });
            const data = await res.json();
            clearMessages();
            appendMessages(data.messages || []);
            renderOptions(data.options || []);
            updatePlaceholder(data.stage);
        } catch (err) {
            console.error(err);
        }
    }

    // Send message
    async function sendMessage(text) {
        if (!sessionId || isSending) return;
        const trimmed = text.trim();
        if (!trimmed) return;

        addMessage('user', trimmed);
        renderOptions([]);
        inputEl.value = '';
        inputEl.focus();

        isSending = true;
        try {
            const res = await fetch(`${API_BASE}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ session_id: sessionId, message: trimmed })
            });
            const data = await res.json();
            appendMessages(data.messages || []);
            renderOptions(data.options || []);
            updatePlaceholder(data.stage);
        } catch (err) {
            console.error(err);
            addMessage('bot', 'Something went wrong. Try again in a moment.');
        } finally {
            isSending = false;
        }
    }

    function appendMessages(messages) {
        messages.forEach(msg => addMessage(msg.role, msg.content));
    }

    function addMessage(role, content) {
        const wrapper = document.createElement('div');
        wrapper.className = `ff-chatbot-message ff-chatbot-${role}`;

        const bubble = document.createElement('div');
        bubble.className = 'ff-chatbot-bubble';
        if (role === 'bot') {
            bubble.innerHTML = content.replace(/\n/g, '<br>');
        } else {
            bubble.textContent = content;
        }
        wrapper.appendChild(bubble);
        messagesEl.appendChild(wrapper);
        messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    function renderOptions(options) {
        optionsEl.innerHTML = '';
        if (!options || !options.length) return;
        options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'ff-chatbot-option-pill';
            btn.type = 'button';
            btn.textContent = opt;
            btn.addEventListener('click', () => sendMessage(opt));
            optionsEl.appendChild(btn);
        });
    }

    function clearMessages() {
        messagesEl.innerHTML = '';
        optionsEl.innerHTML = '';
    }

    function updatePlaceholder(stage) {
        if (stage === 'ask_name') {
            inputEl.placeholder = 'Type your name…';
        } else {
            inputEl.placeholder = 'Ask about programs, stats, etc.';
        }
    }

    // Event listeners
    sendBtn.addEventListener('click', () => sendMessage(inputEl.value));
    inputEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage(inputEl.value);
        }
    });
    resetBtn.addEventListener('click', () => resetSession());

    // Initialize
    createSession();
}

