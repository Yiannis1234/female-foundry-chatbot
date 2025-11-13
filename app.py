from pathlib import Path
import json
import streamlit as st

DATA_PATH = Path("data/index.json")
with DATA_PATH.open("r", encoding="utf-8") as f:
    CONTENT = json.load(f)

# Build a simple knowledge base mapping question IDs to summaries
KNOWLEDGE = {}
for entry in CONTENT:
    if entry["id"].startswith("ff_site_") or entry["id"].startswith("survey_") or entry["id"].startswith("macro_") or entry["id"].startswith("headline_"):
        KNOWLEDGE[entry["id"]] = entry["answer"]

st.set_page_config(page_title="Female Foundry Chatbot", page_icon="🤖", layout="centered")

st.markdown(
    """
    <style>
        :root, body {
            background: linear-gradient(180deg, #f5f4ff 0%, #eff4ff 100%) !important;
            color: #111826;
            font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
        }
        [data-testid="stAppViewContainer"] {
            background: transparent !important;
            padding: 0 !important;
        }
        .stApp > header, .stApp > footer { display: none; }
        section[data-testid="stSidebar"] { display: none !important; }
        [data-testid="stAppViewContainer"] > .main {
            background: transparent !important;
            padding: 0 !important;
            display: flex;
            justify-content: flex-end;
            align-items: flex-end;
            min-height: 100vh;
        }
        [data-testid="stVerticalBlock"] {
            gap: 0 !important;
        }
        [data-testid="element-container"] {
            padding: 0 !important;
            margin: 0 !important;
            background: transparent !important;
        }
        [data-testid="stAppViewContainer"] > .main > div {
            width: 100%;
        }
        [data-testid="stAppViewContainer"] .block-container {
            max-width: 360px !important;
            width: 360px !important;
            margin-left: auto !important;
            margin-right: 28px !important;
            margin-bottom: 24px !important;
            margin-top: auto !important;
            padding: 0 !important;
            background: transparent !important;
        }
        div[data-testid="stVerticalBlock"], div[data-testid="element-container"] { width: 100%; }
        .chat-wrapper {
            width: 100%;
            border-radius: 24px;
            border: 1px solid rgba(255, 255, 255, 0.15);
            background: linear-gradient(160deg, rgba(255,255,255,0.92) 0%, rgba(247,243,255,0.98) 35%, rgba(245,244,255,1) 70%, rgba(255,243,252,0.98) 100%);
            box-shadow: 0 30px 54px rgba(54, 43, 120, 0.18);
            padding: 1.4rem 1.3rem 1.15rem;
            backdrop-filter: blur(12px);
        }
        .chat-wrapper.history {
            border-radius: 22px 22px 0 0;
            margin-bottom: -0.25rem;
            max-height: 320px;
            overflow-y: auto;
            padding-bottom: 0.6rem;
            display: flex;
            flex-direction: column;
            gap: 0.45rem;
        }
        .chat-wrapper.buttons {
            border-radius: 0 0 22px 22px;
            border-top: 1px solid rgba(221, 225, 247, 0.85);
            box-shadow: inset 0 1px 0 rgba(255,255,255,0.8);
            background: linear-gradient(170deg, rgba(248,246,255,0.98) 0%, rgba(255,246,253,0.94) 100%);
            backdrop-filter: blur(8px);
            padding-bottom: 1.05rem;
            display: flex;
            flex-direction: column;
        }
        .logo {
            font-weight: 800;
            font-size: 1.1rem;
            letter-spacing: 0.12em;
            color: #332b64;
            text-transform: uppercase;
            margin-bottom: 0.5rem;
            display: flex;
            align-items: center;
            gap: 0.35rem;
        }
        .logo::before {
            content: "";
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: linear-gradient(135deg, #fd6dc2 0%, #7a4dff 100%);
            display: inline-block;
        }
        .chat-bubble {
            padding: 0.75rem 0.95rem;
            border-radius: 1.05rem;
            margin-bottom: 0.6rem;
            max-width: 100%;
            font-size: 0.95rem;
            line-height: 1.45rem;
        }
        .user-bubble {
            background: linear-gradient(135deg, #ede9ff 0%, #fdf1ff 100%);
            margin-left: auto;
            color: #302862;
        }
        .bot-bubble {
            background: linear-gradient(135deg, #ffffff 0%, #f1efff 100%);
            border: 1px solid rgba(122, 77, 255, 0.18);
            color: #262b3f;
        }
        .chat-controls-title {
            font-size: 0.82rem;
            font-weight: 700;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            color: #6b54e3;
            margin-bottom: 0.45rem;
        }
        .chat-wrapper.buttons div[data-testid="stButton"] {
            width: 100%;
            margin-bottom: 0.45rem;
        }
        .chat-wrapper.buttons div[data-testid="stButton"]:last-child {
            margin-bottom: 0;
        }
        .chat-wrapper.buttons div[data-testid="stButton"] > button {
            width: 100%;
            text-align: left;
            padding: 0.78rem 0.95rem;
            border-radius: 13px;
            border: none;
            background: linear-gradient(135deg, #7b5cff 0%, #ff69c8 100%);
            color: #ffffff;
            font-weight: 600;
            font-size: 0.96rem;
            box-shadow: 0 12px 20px rgba(123, 92, 255, 0.25);
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        div[data-testid="stButton"] > button:hover {
            transform: translateY(-1px);
            box-shadow: 0 16px 24px rgba(123, 92, 255, 0.32);
        }
        .chat-wrapper.buttons div[data-testid="textInputRoot"] {
            margin-bottom: 0.55rem;
        }
        .chat-wrapper.buttons div[data-testid="textInputRoot"] input {
            border-radius: 12px;
            border: 1px solid rgba(120, 96, 255, 0.45);
            background: linear-gradient(135deg, #f6f3ff 0%, rgba(255, 246, 253, 0.95) 100%);
            padding: 0.72rem 0.9rem;
            font-size: 0.95rem;
            color: #2c1f6c;
            transition: border 0.2s ease, box-shadow 0.2s ease;
        }
        .chat-wrapper.buttons div[data-testid="textInputRoot"] label {
            font-size: 0.85rem;
            font-weight: 600;
            color: #2c1f6c;
            display: none;
        }
        .chat-wrapper.buttons div[data-testid="textInputRoot"] input:focus {
            outline: none;
            border-color: rgba(120, 96, 255, 0.9);
            box-shadow: 0 0 0 3px rgba(122, 77, 255, 0.18);
        }
        .chat-launcher {
            position: fixed;
            right: 32px;
            bottom: 108px;
            z-index: 999;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.35rem;
        }
        .chat-launcher div[data-testid="stButton"] {
            margin: 0 !important;
        }
        .chat-launcher div[data-testid="stButton"] > button {
            width: 64px;
            height: 64px;
            border-radius: 50%;
            border: none;
            background: linear-gradient(135deg, #7a4dff, #fd6dc2);
            color: #fff;
            font-size: 1.6rem;
            box-shadow: 0 18px 36px rgba(45, 37, 89, 0.22);
        }
        .chat-launcher div[data-testid="stButton"] > button:hover {
            filter: brightness(1.08);
        }
        .chat-launcher .launcher-label {
            margin-top: 0.45rem;
            text-align: center;
            font-size: 0.75rem;
            font-weight: 600;
            color: #2c1f6c;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        @media (max-width: 640px) {
            [data-testid="stAppViewContainer"] .block-container {
                max-width: 100% !important;
                width: 100% !important;
                margin-right: 16px !important;
            }
            .chat-launcher {
                right: 18px;
                bottom: 86px;
            }
        }
        .footer {
            font-size: 0.72rem;
            color: #7d8090;
            text-align: right;
            margin-right: 2.5rem;
            margin-top: 0.8rem;
        }
    </style>
    """,
    unsafe_allow_html=True,
)

if "chat_open" not in st.session_state:
    st.session_state["chat_open"] = False

if "chat_seen" not in st.session_state:
    st.session_state["chat_open"] = True
    st.session_state["chat_seen"] = True

if "stage" not in st.session_state:
    st.session_state["stage"] = "intro"
    st.session_state["chat_log"] = []

launcher_container = st.empty()
with launcher_container:
    st.markdown('<div class="chat-launcher">', unsafe_allow_html=True)
    icon = "✖" if st.session_state["chat_open"] else "💬"
    launcher_clicked = st.button(icon, key="chat_launcher_button")
    st.markdown(
        f'<div class="launcher-label">{ "Close" if st.session_state["chat_open"] else "Chat" }</div>',
        unsafe_allow_html=True,
    )
    st.markdown('</div>', unsafe_allow_html=True)

if launcher_clicked:
    st.session_state["chat_open"] = not st.session_state["chat_open"]
    st.rerun()

if st.session_state["chat_open"]:
    chat_container = st.container()
    button_container = st.container()

    with chat_container:
        st.markdown('<div class="chat-wrapper history">', unsafe_allow_html=True)
        st.markdown('<div class="logo">FEMALE FOUNDRY</div>', unsafe_allow_html=True)

        if st.session_state["chat_log"]:
            for role, text in st.session_state["chat_log"]:
                bubble_class = "user-bubble" if role == "user" else "bot-bubble"
                st.markdown(f'<div class="chat-bubble {bubble_class}">{text}</div>', unsafe_allow_html=True)
        else:
            st.markdown(
                '<div class="chat-bubble bot-bubble">Hi! I’m the Female Foundry assistant. Shall we get started?</div>',
                unsafe_allow_html=True,
            )
        st.markdown('</div>', unsafe_allow_html=True)

    with button_container:
        st.markdown('<div class="chat-wrapper buttons">', unsafe_allow_html=True)

        titles = {
            "intro": "Ready to begin?",
            "ask_name": "Tell me a bit about you",
            "menu_primary": "Pick a path to explore",
            "menu_secondary": "Drill deeper",
            "show_info": "Here’s what I found",
        }
        st.markdown(
            f'<div class="chat-controls-title">{titles.get(st.session_state["stage"], "Continue")}</div>',
            unsafe_allow_html=True,
        )

        if st.session_state["stage"] == "intro":
            if st.button("I’m ready"):
                st.session_state["chat_log"].append(("bot", "First things first—what’s your name?"))
                st.session_state["stage"] = "ask_name"
                st.rerun()

        elif st.session_state["stage"] == "ask_name":
            name = st.text_input(
                "Your name",
                key="visitor_name_input",
                placeholder="Type your name…",
                label_visibility="collapsed",
            )
            if st.button("Continue", key="visitor_name_submit"):
                if name.strip():
                    st.session_state["visitor_name"] = name.strip().title()
                    st.session_state["chat_log"].append(("user", name.strip().title()))
                    st.session_state["chat_log"].append(
                        ("bot", f"Nice to meet you, {name.strip().title()}! Choose what you’d like to explore:")
                    )
                    st.session_state["stage"] = "menu_primary"
                    st.rerun()
                else:
                    st.warning("Let’s capture your name before we go on.")

        elif st.session_state["stage"] == "menu_primary":
            options = [
                "VC & Funding Insights",
                "Female Foundry Programs",
                "Community & Stories",
                "Contact & Partners"
            ]
            for opt in options:
                if st.button(opt, key=opt):
                    st.session_state["chat_log"].append(("user", opt))
                    st.session_state["primary_choice"] = opt
                    st.session_state["stage"] = "menu_secondary"
                    st.rerun()

        elif st.session_state["stage"] == "menu_secondary":
            choice = st.session_state.get("primary_choice")
            sub_map = {
                "VC & Funding Insights": ["Headline metrics", "Deep Tech & AI", "Using the Index"],
                "Female Foundry Programs": ["AI Visionaries", "AI Hustle", "Sunday Newsletter"],
                "Community & Stories": ["Join the community", "Campaigns", "Shop"],
                "Contact & Partners": ["Contact", "Partners", "Media coverage"]
            }
            for opt in sub_map.get(choice, []):
                if st.button(opt, key=opt):
                    st.session_state["chat_log"].append(("user", opt))
                    st.session_state["sub_choice"] = opt
                    st.session_state["stage"] = "show_info"
                    st.rerun()

        elif st.session_state["stage"] == "show_info":
            info_map = {
                "Headline metrics": KNOWLEDGE.get("headline_female_founders_2024"),
                "Deep Tech & AI": KNOWLEDGE.get("science_stem_female_founders"),
                "Using the Index": (
                    "Use the Index’s funnel metrics plus Dealroom exports (DR_FF_C_1 for VC into female-founded companies, "
                    "DR_MC_C_5 for monthly totals) to build investment memos and monitor trends. "
                    "The homepage’s ‘Female Innovation Index’ section links straight to the 2025 edition."
                ),
                "AI Visionaries": (
                    "Female Foundry’s AI incubator with Google Cloud supports founders experimenting with frontier AI. "
                    "Click “Visit AI Visionaries” on the hero section to view cohorts, mentors, and application timing."
                ),
                "AI Hustle": (
                    "AI Hustle is a free monthly 1-hour clinic with Agata Nowicka (up to three founders per session). "
                    "Hit “Sign Up” in the AI Hustle panel to request a slot."
                ),
                "Sunday Newsletter": (
                    "Stay informed with the Sunday Newsletter—venture news, fundraising tips, ecosystem insights. "
                    "Select “Read” in the newsletter section to subscribe."
                ),
                "Join the community": (
                    "Join the 7,000+ strong community of founders, investors, and operators via the “Join the Community” button. "
                    "It unlocks intros, resources, and access to Female Foundry programs."
                ),
                "Campaigns": (
                    "Scroll to “Celebrating female founders” and tap “Watch all” to see storytelling campaigns filmed from a female perspective."
                ),
                "Shop": (
                    "The Female Foundry Shop (linked in the footer) offers identity assets and merchandise—ideal for events, partners, or supporter gifts."
                ),
                "Contact": KNOWLEDGE.get("ff_site_contact"),
                "Partners": KNOWLEDGE.get("ff_site_navigation"),
                "Media coverage": (
                    "Female Foundry is featured in FT Adviser, Maddyness, tech.eu, UKTN, Sifted, Startups Magazine, TFN and more. "
                    "Use these logos (shown above the partner grid) in your decks or press materials."
                )
            }
            answer = info_map.get(st.session_state.get("sub_choice"), "")
            st.session_state["chat_log"].append(("bot", answer))
            st.session_state["chat_log"].append(("bot", "Anything else you'd like to explore?"))
            st.session_state["stage"] = "menu_primary"
            st.rerun()

        st.markdown('</div>', unsafe_allow_html=True)

    st.markdown('<div class="chat-wrapper footer">Powered by Female Foundry • Embed this widget inside Wix via iframe.</div>', unsafe_allow_html=True)