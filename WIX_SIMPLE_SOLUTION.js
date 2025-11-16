// ============================================
// COMPLETE WIX VELO CHATBOT - NO EXTERNAL HOSTING
// Copy and paste this ENTIRE code into your Wix page code
// ============================================

$w.onReady(function () {

    // Your existing counter animation
    $w("#text1833").onViewportEnter(() => {
        animateNumberCounter("#text1833", 144990, 145038, 1200);
    });

    // Initialize chatbot - use window.onload to ensure DOM is ready
    console.log('$w.onReady fired - starting chatbot initialization...');
    
    // Wait for full page load
    if (typeof window !== 'undefined') {
        if (document.readyState === 'complete') {
            console.log('Document already complete, initializing now');
            setTimeout(() => initChatbot(), 100);
        } else {
            window.addEventListener('load', () => {
                console.log('Window load event fired');
                setTimeout(() => initChatbot(), 500);
            });
        }
    }
    
    // Also try multiple times as fallback
    setTimeout(() => {
        console.log('Fallback init attempt 1');
        initChatbot();
    }, 1000);
    
    setTimeout(() => {
        console.log('Fallback init attempt 2');
        initChatbot();
    }, 2500);
    
    setTimeout(() => {
        console.log('Fallback init attempt 3');
        initChatbot();
    }, 5000);
});

// Your existing counter functions
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
// CHATBOT - ALL EMBEDDED, NO EXTERNAL HOSTING
// ============================================

// Chatbot data and logic (all embedded)
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

// Chatbot state management
let chatbotState = {
    stage: "ask_name",
    visitorName: null,
    primaryChoice: null,
    history: []
};

function initChatbot() {
    console.log('initChatbot called');
    
    if (typeof window === 'undefined' || typeof document === 'undefined') {
        console.log('Waiting for window/document...');
        setTimeout(initChatbot, 500);
        return;
    }

    if (document.getElementById('ff-chatbot-launcher')) {
        console.log('Chatbot already exists');
        return;
    }

    if (!document.body) {
        console.log('Waiting for body...');
        setTimeout(initChatbot, 200);
        return;
    }

    console.log('Initializing chatbot...');
    try {
        injectChatbotCSS();
        createChatbotHTML();
        initChatbotLogic();
        console.log('Chatbot initialized successfully!');
    } catch (error) {
        console.error('Error initializing chatbot:', error);
    }
}

function injectChatbotCSS() {
    const style = document.createElement('style');
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
            z-index: 9999999 !important;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3) !important;
            transition: transform 0.2s, box-shadow 0.2s !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            visibility: visible !important;
            opacity: 1 !important;
        }
        #ff-chatbot-launcher:hover {
            transform: scale(1.05);
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
        }
        #ff-chatbot-popup {
            position: fixed !important;
            right: 24px !important;
            bottom: 24px !important;
            z-index: 9999998 !important;
            transition: transform 0.25s ease, opacity 0.25s ease !important;
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

function createChatbotHTML() {
    console.log('Creating chatbot HTML...');
    
    // Check if already exists
    if (document.getElementById('ff-chatbot-launcher')) {
        console.log('Chatbot HTML already exists');
        return;
    }
    
    const container = document.createElement('div');
    container.id = 'ff-chatbot-container';
    container.innerHTML = `
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
        </div>
    `;
    
    if (document.body) {
        document.body.appendChild(container);
        console.log('Chatbot HTML added to body');
        
        // Force visibility
        setTimeout(() => {
            const launcher = document.getElementById('ff-chatbot-launcher');
            if (launcher) {
                console.log('Launcher button found!', launcher);
                launcher.style.display = 'flex';
                launcher.style.visibility = 'visible';
                launcher.style.opacity = '1';
                launcher.style.zIndex = '9999999';
                console.log('Launcher button styles applied:', {
                    display: launcher.style.display,
                    visibility: launcher.style.visibility,
                    zIndex: launcher.style.zIndex
                });
            } else {
                console.error('Launcher button NOT found after creation!');
            }
        }, 100);
    } else {
        console.error('document.body is null!');
    }
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

    // Reset
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

    // Send message
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

        // Keyword matching for primary
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

        // Check if it's a primary option click
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

        // Keyword matching for secondary
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

        // Check if it's a secondary option click
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

        // Fallback
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

    // Event listeners
    sendBtn.addEventListener('click', () => sendMessage(inputEl.value));
    inputEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage(inputEl.value);
        }
    });

    // Initialize
    addMessage('bot', "Hi! I'm the Female Foundry assistant. What's your name?");
    renderOptions([]);
    updatePlaceholder('ask_name');
}

