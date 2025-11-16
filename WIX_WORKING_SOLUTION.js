// WORKING WIX VELO CHATBOT SOLUTION
// This version uses multiple methods to ensure the button appears

$w.onReady(function () {
    console.log('=== WIX CODE STARTED ===');
    
    // Your counter animation
    $w("#text1833").onViewportEnter(() => {
        animateNumberCounter("#text1833", 144990, 145038, 1200);
    });

    // Initialize chatbot with multiple attempts
    initChatbotWithRetries();
});

function easeOutExpo(t, b, c, d) {
    if (t < 0.7 * d) {
        return b + (c * (t / d));
    } else {
        return b + c * (1 - Math.pow(2, -10 * (t - 0.7 * d) / (0.3 * d)));
    }
}

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
// CHATBOT CODE
// ============================================

const CHATBOT_DATA = {
    PRIMARY_OPTIONS: [
        "VC & Funding Insights",
        "Female Foundry Programs",
        "Community & Stories",
        "Contact & Partners",
    ],
    SECONDARY_OPTIONS: {
        "VC & Funding Insights": ["Headline metrics", "Deep Tech & AI", "Using the Index"],
        "Female Foundry Programs": ["AI Visionaries", "AI Hustle", "Sunday Newsletter"],
        "Community & Stories": ["Join the community", "Campaigns", "Shop"],
        "Contact & Partners": ["Contact", "Partners", "Media coverage"],
    },
    PRIMARY_KEYWORDS: {
        "funding": "VC & Funding Insights",
        "vc": "VC & Funding Insights",
        "investment": "VC & Funding Insights",
        "program": "Female Foundry Programs",
        "incubator": "Female Foundry Programs",
        "ai hustle": "Female Foundry Programs",
        "visionaries": "Female Foundry Programs",
        "community": "Community & Stories",
        "stories": "Community & Stories",
        "shop": "Community & Stories",
        "contact": "Contact & Partners",
        "partner": "Contact & Partners",
        "press": "Contact & Partners",
    },
    SECONDARY_KEYWORDS: {
        "headline": "Headline metrics",
        "stat": "Headline metrics",
        "metrics": "Headline metrics",
        "deep tech": "Deep Tech & AI",
        "ai": "Deep Tech & AI",
        "index": "Using the Index",
        "ai visionaries": "AI Visionaries",
        "visionaries": "AI Visionaries",
        "ai hustle": "AI Hustle",
        "hustle": "AI Hustle",
        "newsletter": "Sunday Newsletter",
        "join the community": "Join the community",
        "community": "Join the community",
        "campaign": "Campaigns",
        "shop": "Shop",
        "contact": "Contact",
        "email": "Contact",
        "partner": "Partners",
        "media": "Media coverage",
    },
    INFO_MAP: {
        "Headline metrics": "• €5.76B raised by female-founded startups in Europe during 2024 (1,305 deals across 1,196 companies).\n• Represents roughly 12% of all European VC; deep tech attracts about one-third of that capital.\n• The Female Innovation Index aggregates 1,200+ survey responses and tracks 145k+ companies.",
        "Deep Tech & AI": "• Deep tech companies capture roughly one-third of the capital raised by female-founded startups.\n• Data & AI founders cite funding (67 mentions) and slow adoption (47) as top bottlenecks.\n• Health & life-science founders echo funding, adoption, and economic uncertainty challenges—filter Dealroom tags for precise counts.",
        "Using the Index": "• Use Dealroom exports DR_FF_C_1 (female-founded VC) and DR_MC_C_5 (monthly capital) for charts.\n• Funnel views reveal drop-off points across awareness, acceleration, and funding.\n• Start from the 2025 Index landing page for methodology and download links.",
        "AI Visionaries": "• Female Foundry's AI incubator with Google Cloud for frontier AI founders.\n• 'Visit AI Visionaries' shows cohorts, mentors, curriculum, and application windows.\n• Offers tailored GTM support, mentor office hours, and showcase opportunities.",
        "AI Hustle": "• Free monthly 1-hour clinic with Agata Nowicka (up to three founders).\n• Tap the homepage 'Sign Up' CTA to request a slot.\n• Ideal for quick GTM troubleshooting, warm intros, and accountability.",
        "Sunday Newsletter": "• Weekly roundup covering funding news, founder tactics, and ecosystem signals.\n• Use the homepage 'Read' button to browse the latest edition or subscribe.\n• Designed for female founders, operators, and allies tracking European venture.",
        "Join the community": "• 7,000+ founders, investors, and operators in the Female Foundry network.\n• Click 'Join the Community' on the homepage to submit your membership form.\n• Welcome call scheduled within five business days.",
        "Campaigns": "• Watch founder stories and community highlights via the homepage 'Watch' CTA.\n• Celebrates female founders building across Europe.\n• Shareable content for social media and events.",
        "Shop": "• Access the Female Foundry Shop from the footer.\n• Merchandise and resources for community members.\n• Proceeds support Female Foundry initiatives.",
        "Contact": "• Email: HELLO@FEMALEFOUNDRY.CO\n• Address: 11 Welbeck Street, W1G 9XZ, London\n• Footer links to About, Partners, Careers, and privacy policy.",
        "Partners": "• View partner logos on the homepage header.\n• Includes Carta, Accenture, London Stock Exchange, Cooley, Google Cloud, HSBC Innovation Banking.\n• Footer links to partner pages.",
        "Media coverage": "• Press inquiries: HELLO@FEMALEFOUNDRY.CO\n• Female Innovation Index reports available for download.\n• Media kit and founder stories accessible via footer.",
    }
};

let chatbotState = {
    stage: "ask_name",
    visitorName: null,
    primaryChoice: null,
    history: []
};

function initChatbotWithRetries() {
    console.log('initChatbotWithRetries called');
    
    // Try immediately
    tryInit();
    
    // Try after delays
    setTimeout(tryInit, 500);
    setTimeout(tryInit, 1500);
    setTimeout(tryInit, 3000);
    setTimeout(tryInit, 5000);
    
    // Also try on window load
    if (typeof window !== 'undefined') {
        window.addEventListener('load', () => {
            console.log('Window load event');
            setTimeout(tryInit, 500);
        });
    }
}

function tryInit() {
    console.log('tryInit called, checking environment...');
    
    if (typeof window === 'undefined') {
        console.log('window undefined');
        return;
    }
    
    if (typeof document === 'undefined') {
        console.log('document undefined');
        return;
    }
    
    if (!document.body) {
        console.log('document.body not available');
        return;
    }
    
    // Check if already exists
    if (document.getElementById('ff-chatbot-launcher')) {
        console.log('Chatbot already exists');
        return;
    }
    
    console.log('Environment OK, initializing chatbot...');
    
    try {
        injectChatbotCSS();
        createChatbotHTML();
        initChatbotLogic();
        console.log('Chatbot initialization complete!');
    } catch (error) {
        console.error('Error in tryInit:', error);
    }
}

function injectChatbotCSS() {
    // Check if already injected
    if (document.getElementById('ff-chatbot-styles')) {
        return;
    }
    
    const style = document.createElement('style');
    style.id = 'ff-chatbot-styles';
    style.textContent = `
        #ff-chatbot-launcher {
            position: fixed !important;
            bottom: 24px !important;
            right: 24px !important;
            width: 64px !important;
            height: 64px !important;
            border-radius: 50% !important;
            background: #1a1a1a !important;
            color: #ffffff !important;
            border: none !important;
            font-size: 1.6rem !important;
            cursor: pointer !important;
            z-index: 2147483647 !important;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3) !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            visibility: visible !important;
            opacity: 1 !important;
            pointer-events: auto !important;
        }
        #ff-chatbot-popup {
            position: fixed !important;
            right: 24px !important;
            bottom: 24px !important;
            z-index: 2147483646 !important;
        }
        #ff-chatbot-popup.ff-chatbot-hidden {
            transform: translateY(18px) scale(0.97) !important;
            opacity: 0 !important;
            pointer-events: none !important;
        }
        .ff-chatbot-card {
            width: 420px !important;
            max-height: 680px !important;
            background: #ffffff !important;
            border-radius: 16px !important;
            border: 1px solid #e0e0e0 !important;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2) !important;
            overflow: hidden !important;
            display: flex !important;
            flex-direction: column !important;
        }
        .ff-chatbot-header {
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
            padding: 1rem 1.25rem !important;
            background: #1a1a1a !important;
            border-bottom: 1px solid #333 !important;
        }
        .ff-chatbot-title {
            display: flex !important;
            align-items: center !important;
            gap: 10px !important;
            font-weight: 700 !important;
            letter-spacing: 0.1em !important;
            text-transform: uppercase !important;
            color: #ffffff !important;
            font-size: 0.85rem !important;
        }
        .ff-chatbot-dot {
            width: 10px !important;
            height: 10px !important;
            border-radius: 50% !important;
            background: #ff0000 !important;
            display: inline-block !important;
            animation: ff-pulse 2s infinite !important;
        }
        @keyframes ff-pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
        .ff-chatbot-actions {
            display: flex !important;
            gap: 6px !important;
        }
        .ff-chatbot-ghost-btn {
            width: 32px !important;
            height: 32px !important;
            border: none !important;
            border-radius: 8px !important;
            background: rgba(255, 255, 255, 0.1) !important;
            color: #ffffff !important;
            font-size: 1rem !important;
            cursor: pointer !important;
        }
        .ff-chatbot-ghost-btn:hover {
            background: rgba(255, 255, 255, 0.2) !important;
        }
        .ff-chatbot-scroll {
            max-height: 420px !important;
            overflow-y: auto !important;
            padding: 1.25rem !important;
            display: flex !important;
            flex-direction: column !important;
            gap: 0.85rem !important;
            background: #ffffff !important;
        }
        .ff-chatbot-message {
            display: flex !important;
            align-items: flex-start !important;
            gap: 12px !important;
        }
        .ff-chatbot-message.ff-chatbot-user {
            justify-content: flex-end !important;
        }
        .ff-chatbot-bubble {
            padding: 0.85rem 1.1rem !important;
            border-radius: 14px !important;
            font-size: 0.95rem !important;
            line-height: 1.6rem !important;
            max-width: 300px !important;
            word-break: break-word !important;
        }
        .ff-chatbot-message.ff-chatbot-bot .ff-chatbot-bubble {
            background: #f5f5f5 !important;
            border: 1px solid #e0e0e0 !important;
            color: #1a1a1a !important;
        }
        .ff-chatbot-message.ff-chatbot-user .ff-chatbot-bubble {
            background: #1a1a1a !important;
            color: #ffffff !important;
            border: none !important;
        }
        .ff-chatbot-options {
            display: flex !important;
            flex-wrap: wrap !important;
            gap: 10px !important;
            padding: 0 1.1rem 0.55rem !important;
        }
        .ff-chatbot-option-pill {
            padding: 10px 16px !important;
            border-radius: 20px !important;
            background: #ffffff !important;
            border: 2px solid #1a1a1a !important;
            color: #1a1a1a !important;
            font-size: 0.87rem !important;
            font-weight: 600 !important;
            cursor: pointer !important;
        }
        .ff-chatbot-option-pill:hover {
            background: #1a1a1a !important;
            color: #ffffff !important;
        }
        .ff-chatbot-input-bar {
            display: flex !important;
            align-items: center !important;
            gap: 10px !important;
            padding: 1rem 1.25rem !important;
            background: #fafafa !important;
            border-top: 1px solid #e0e0e0 !important;
        }
        #ff-chatbot-input {
            flex: 1 !important;
            border: 2px solid #e0e0e0 !important;
            border-radius: 12px !important;
            padding: 0.8rem 1rem !important;
            font-size: 0.95rem !important;
            color: #1a1a1a !important;
            background: #ffffff !important;
        }
        #ff-chatbot-input:focus {
            outline: none !important;
            border-color: #ff0000 !important;
        }
        .ff-chatbot-send-btn {
            border: none !important;
            border-radius: 12px !important;
            background: #1a1a1a !important;
            color: #ffffff !important;
            font-weight: 600 !important;
            padding: 0.8rem 1.4rem !important;
            cursor: pointer !important;
        }
        .ff-chatbot-send-btn:hover {
            background: #333333 !important;
        }
        .ff-chatbot-footer-links {
            padding: 0.9rem 1.25rem 1rem !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 12px !important;
            font-size: 0.8rem !important;
            color: #666666 !important;
            background: #fafafa !important;
            border-top: 1px solid #e0e0e0 !important;
        }
        .ff-chatbot-footer-links a {
            color: #1a1a1a !important;
            font-weight: 600 !important;
            text-decoration: none !important;
        }
        .ff-chatbot-footer-links a:hover {
            color: #ff0000 !important;
            text-decoration: underline !important;
        }
    `;
    
    document.head.appendChild(style);
    console.log('CSS injected');
}

function createChatbotHTML() {
    console.log('createChatbotHTML called');
    
    if (document.getElementById('ff-chatbot-launcher')) {
        console.log('Already exists');
        return;
    }
    
    const launcher = document.createElement('button');
    launcher.id = 'ff-chatbot-launcher';
    launcher.innerHTML = '💬';
    launcher.setAttribute('aria-label', 'Open chat');
    
    const popup = document.createElement('div');
    popup.id = 'ff-chatbot-popup';
    popup.className = 'ff-chatbot-hidden';
    popup.innerHTML = `
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
                <input type="text" id="ff-chatbot-input" placeholder="Type your name…" autocomplete="off" />
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
    `;
    
    // Try multiple methods to append
    try {
        document.body.appendChild(launcher);
        document.body.appendChild(popup);
        console.log('Elements appended to body');
    } catch (e) {
        console.error('Error appending to body:', e);
        // Try appending to document.documentElement
        try {
            document.documentElement.appendChild(launcher);
            document.documentElement.appendChild(popup);
            console.log('Elements appended to documentElement');
        } catch (e2) {
            console.error('Error appending to documentElement:', e2);
        }
    }
    
    // Force visibility after a moment
    setTimeout(() => {
        const btn = document.getElementById('ff-chatbot-launcher');
        if (btn) {
            btn.style.cssText += 'display: flex !important; visibility: visible !important; opacity: 1 !important;';
            console.log('Button visibility forced', btn);
            console.log('Button computed style:', window.getComputedStyle(btn).display);
        } else {
            console.error('Button not found after creation!');
        }
    }, 200);
}

function initChatbotLogic() {
    const launcher = document.getElementById('ff-chatbot-launcher');
    const popup = document.getElementById('ff-chatbot-popup');
    const closeBtn = document.getElementById('ff-chatbot-close');
    const resetBtn = document.getElementById('ff-chatbot-reset');
    const messagesEl = document.getElementById('ff-chatbot-messages');
    const optionsEl = document.getElementById('ff-chatbot-options');
    const inputEl = document.getElementById('ff-chatbot-input');
    const sendBtn = document.getElementById('ff-chatbot-send');

    if (!launcher || !popup) {
        console.error('Required elements not found!');
        return;
    }

    launcher.addEventListener('click', () => {
        popup.classList.remove('ff-chatbot-hidden');
        launcher.style.display = 'none';
        inputEl.focus();
    });

    closeBtn.addEventListener('click', () => {
        popup.classList.add('ff-chatbot-hidden');
        launcher.style.display = 'flex';
    });

    resetBtn.addEventListener('click', () => {
        chatbotState = {
            stage: "ask_name",
            visitorName: null,
            primaryChoice: null,
            history: []
        };
        clearMessages();
        addMessage('bot', "Hi! I'm the Female Foundry assistant. What's your name?");
        renderOptions([]);
        updatePlaceholder('ask_name');
    });

    function sendMessage(text) {
        const trimmed = text.trim();
        if (!trimmed) return;

        addMessage('user', trimmed);
        renderOptions([]);
        inputEl.value = '';

        const response = handleChatbotMessage(trimmed);
        if (response.messages) {
            response.messages.forEach(msg => addMessage(msg.role, msg.content));
        }
        renderOptions(response.options || []);
        updatePlaceholder(response.stage);
        inputEl.focus();
    }

    function handleChatbotMessage(message) {
        const trimmed = message.trim().toLowerCase();
        const state = chatbotState;

        if (state.stage === "ask_name") {
            state.visitorName = message.trim();
            state.stage = "menu_primary";
            return {
                messages: [{
                    role: "bot",
                    content: `Nice to meet you, ${state.visitorName}! Choose what you'd like to explore:`
                }],
                options: CHATBOT_DATA.PRIMARY_OPTIONS,
                stage: state.stage
            };
        }

        let matchedPrimary = null;
        for (const [keyword, option] of Object.entries(CHATBOT_DATA.PRIMARY_KEYWORDS)) {
            if (trimmed.includes(keyword)) {
                matchedPrimary = option;
                break;
            }
        }

        if (matchedPrimary) {
            state.primaryChoice = matchedPrimary;
            state.stage = "menu_secondary";
            return {
                messages: [{
                    role: "bot",
                    content: `Great! Let's drill into ${matchedPrimary}. Pick a specific topic:`
                }],
                options: CHATBOT_DATA.SECONDARY_OPTIONS[matchedPrimary] || [],
                stage: state.stage
            };
        }

        if (CHATBOT_DATA.PRIMARY_OPTIONS.some(opt => opt.toLowerCase() === trimmed)) {
            const matched = CHATBOT_DATA.PRIMARY_OPTIONS.find(opt => opt.toLowerCase() === trimmed);
            state.primaryChoice = matched;
            state.stage = "menu_secondary";
            return {
                messages: [{
                    role: "bot",
                    content: `Great! Let's drill into ${matched}. Pick a specific topic:`
                }],
                options: CHATBOT_DATA.SECONDARY_OPTIONS[matched] || [],
                stage: state.stage
            };
        }

        let matchedSecondary = null;
        for (const [keyword, option] of Object.entries(CHATBOT_DATA.SECONDARY_KEYWORDS)) {
            if (trimmed.includes(keyword)) {
                matchedSecondary = option;
                break;
            }
        }

        if (matchedSecondary) {
            const info = CHATBOT_DATA.INFO_MAP[matchedSecondary] || "I don't have that snippet yet—try another option.";
            state.stage = "menu_primary";
            state.primaryChoice = null;
            return {
                messages: [
                    { role: "bot", content: info },
                    { role: "bot", content: "Anything else you'd like to explore?" }
                ],
                options: CHATBOT_DATA.PRIMARY_OPTIONS,
                stage: state.stage
            };
        }

        const allSecondary = Object.values(CHATBOT_DATA.SECONDARY_OPTIONS).flat();
        if (allSecondary.some(opt => opt.toLowerCase() === trimmed)) {
            const matched = allSecondary.find(opt => opt.toLowerCase() === trimmed);
            const info = CHATBOT_DATA.INFO_MAP[matched] || "I don't have that snippet yet—try another option.";
            state.stage = "menu_primary";
            state.primaryChoice = null;
            return {
                messages: [
                    { role: "bot", content: info },
                    { role: "bot", content: "Anything else you'd like to explore?" }
                ],
                options: CHATBOT_DATA.PRIMARY_OPTIONS,
                stage: state.stage
            };
        }

        return {
            messages: [{
                role: "bot",
                content: "I'm not sure I understand. Try selecting one of the options above, or ask about funding, programs, or the community!"
            }],
            options: state.stage === "menu_primary" ? CHATBOT_DATA.PRIMARY_OPTIONS : (CHATBOT_DATA.SECONDARY_OPTIONS[state.primaryChoice] || []),
            stage: state.stage
        };
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

    sendBtn.addEventListener('click', () => sendMessage(inputEl.value));
    inputEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage(inputEl.value);
        }
    });

    addMessage('bot', "Hi! I'm the Female Foundry assistant. What's your name?");
    renderOptions([]);
    updatePlaceholder('ask_name');
}

