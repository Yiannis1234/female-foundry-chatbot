from __future__ import annotations

import html
import json
import re
from pathlib import Path
from typing import Dict, List, Tuple
from uuid import uuid4

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

DATA_PATH = Path("data/index.json")
# Create data directory if it doesn't exist
if not DATA_PATH.parent.exists():
    DATA_PATH.parent.mkdir(parents=True)
    
# Create empty index.json if it doesn't exist
if not DATA_PATH.exists():
    with DATA_PATH.open("w", encoding="utf-8") as f:
        json.dump({}, f)

with DATA_PATH.open("r", encoding="utf-8") as f:
    try:
        CONTENT = json.load(f)
    except json.JSONDecodeError:
        CONTENT = {}

# --- CONFIGURATION ---

PRIMARY_OPTIONS = [
    "The Era of Abundance",
    "Key Insights",
    "Idea",
    "Fundraising trends",
    "Behind the Index",
    "About Female Foundry",
]

# These are the sub-options for the boxes that lead to a chat flow
SECONDARY_OPTIONS: Dict[str, List[str]] = {
    "Key Insights": ["Methodology", "Key Findings"],
    "Fundraising trends": [
        "Funding Data",
        "By Country Analysis",
        "By Sector Analysis",
        "Top Funding Rounds",
        "IPOs and Exits",
        "Focus on Deeptech"
    ],
    "Behind the Index": [
        "The Team",
        "The Sponsors",
        "The Contributors",
        "The Partners"
    ],
}

# Mapping user friendly names to internal logic or just straight text
# We can allow the user to click "Key Insights" (Box 2) -> Bot says text -> User sees buttons "Methodology", "Key Insights"
# Note: "Key Insights" button inside "Key Insights" box might be confusing. Let's stick to the requested "Key Insights" button name.

PRIMARY_KEYWORDS: Dict[str, str] = {
    "abundance": "The Era of Abundance",
    "ai": "The Era of Abundance",
    "insights": "Key Insights",
    "idea": "Idea",
    "fundraising": "Fundraising trends",
    "funding": "Fundraising trends",
    "behind": "Behind the Index",
    "team": "Behind the Index",
    "partners": "Behind the Index",
    "about": "About Female Foundry",
}

SECONDARY_KEYWORDS: Dict[str, str] = {
    # Fundraising
    "country": "By Country Analysis",
    "sector": "By Sector Analysis",
    "rounds": "Top Funding Rounds",
    "ipo": "IPOs and Exits",
    "exits": "IPOs and Exits",
    "deeptech": "Focus on Deeptech",
    "deep tech": "Focus on Deeptech",
    
    # Behind the Index
    "sponsors": "The Sponsors",
    "contributors": "The Contributors",
}

INFO_MAP: Dict[str, str] = {
    # --- BOX 2 FLOW ---
    "Key Insights": (
        "Fantastic! Sounds like you're on the move— I'll keep it short and sweet.<br><br>"
        "Should we jump straight into the key insights, or do you want the behind-the-scenes scoop on the methodology?"
    ),
    "Methodology": (
        "Our methodology involves a rigorous analysis of public and private data sources to map the landscape of female entrepreneurship.<br><br>"
        "<a href='https://www.femaleinnovationindex.com/methodology' target='_top' rel='noopener noreferrer' class='chat-link-btn'>View Full Methodology</a>"
    ),
    "Key Findings": ( 
        # This corresponds to the "Key Findings" button inside the Key Insights flow.
        "• €5.76B raised by female-founded startups in Europe during 2024.\n"
        "• Represents roughly 12% of all European VC.\n"
        "• Deep tech companies capture roughly one-third of the capital."
    ),

    # --- BOX 4 FLOW ---
    "Fundraising trends": (
        "Love it — let's dig in!<br><br>"
        "I can show you the detailed funding data, break it down by country or sector, "
        "show you the top 50 funding rounds, walk you through the IPO and exit landscape, "
        "or give you a tour of some of the most innovative deeptech startups. What would you like?"
    ),
    "Funding Data": (
        "Based on our 2026 analysis of the Top 50 female-founded companies:\n"
        "• The average company age is 7.62 years.\n"
        "• 98% of these companies were built by founding teams, with only 2% being solo founders.\n"
        "• 91% of the teams are gender-mixed, while 9% are female-only teams.\n"
        "• Education levels are high: 38% of founders hold a Masters degree and 34% hold a PhD."
    ),
    "By Country Analysis": (
        "The United Kingdom leads the pack, home to 26% of the Top 50 companies (13 companies).\n"
        "France follows with 16% (8 companies), then Germany and Sweden with 10% each (5 companies).\n"
        "Spain accounts for 8% (4 companies)."
    ),
    "By Sector Analysis": (
        "Health is the dominant sector, representing 40% of the Top 50 list (20 companies).\n"
        "Fintech follows at 14% (7 companies) and Food at 12% (6 companies).\n"
        "Other notable sectors include Energy (8%) and Transportation (4%)."
    ),
    "Top Funding Rounds": (
        "Some of the largest rounds in our 2026 dataset include:\n"
        "• Abound (UK, Fintech): €288M (Debt)\n"
        "• Quantexa (UK, AI): €206M (Series E)\n"
        "• GlycoEra (Switzerland, Biotech): €153M (Series B)\n"
        "• Dexory (UK, Robotics): €143M (Series B)\n"
        "• SpliceBio (Spain, Biotech): €118M (Series B)"
    ),
    "IPOs and Exits": (
        "Exit activity has been muted across the board, but we saw several high-profile acquisitions in the biotech sector."
    ),
    "Focus on Deeptech": (
        "Deep tech is a major driver of innovation in 2026:\n"
        "• 48% of the Top 50 companies are leveraging AI, with 22% citing AI as their core value.\n"
        "• 81% of female founders on the list have a scientific education.\n"
        "• Key deep tech categories include AI (24%), Medical (22%), and Digital Infrastructure (14%)."
    ),

    # --- BOX 5 FLOW ---
    "Behind the Index": (
        "Ah, going behind the scenes — I like your style.<br><br>"
        "Let's shine a spotlight on the team, the sponsors, the contributors, and the partners who make the Female Innovation Index possible.<br><br>"
        "Grab your popcorn — intros coming up!"
    ),
    "The Team": (
        "Sure, every year it takes a village to get the Index in place. Meet the people behind this edition.<br><br>"
        "<a href='https://www.femaleinnovationindex.com/test?target=team' target='_top' rel='noopener noreferrer' class='chat-link-btn'>Meet the Team</a>"
    ),
    "The Sponsors": (
        "Our sponsors provide the critical support needed to keep this research independent and open-source.<br><br>"
        "<a href='https://www.femaleinnovationindex.com/test?target=partners' target='_top' rel='noopener noreferrer' class='chat-link-btn'>Meet the Sponsors</a>"
    ),
    "The Contributors": (
        "Over 100 industry experts contributed their data and perspectives to this year's Index.<br><br>"
        "<a href='https://www.femaleinnovationindex.com/test?target=partners' target='_top' rel='noopener noreferrer' class='chat-link-btn'>Meet the Contributors</a>"
    ),
    "The Partners": (
        "Our partners help amplify the reach of the Index across the European ecosystem.<br><br>"
        "<a href='https://www.femaleinnovationindex.com/test?target=team' target='_top' rel='noopener noreferrer' class='chat-link-btn'>Meet the Partners</a>"
    ),

    # --- DIRECT LINKS (Handled by Frontend mostly, but fallback here) ---
    "The Era of Abundance": (
        "Opening The Era of Abundance in a new tab.<br><br>"
        "<a href='https://www.femaleinnovationindex.com/innovation' target='_top' rel='noopener noreferrer' class='chat-link-btn'>Open The Era of Abundance</a>"
    ),
    "Idea": (
        "Opening Idea in a new tab.<br><br>"
        "<a href='https://www.femaleinnovationindex.com/idea?target=section100' target='_top' rel='noopener noreferrer' class='chat-link-btn'>Open Idea</a>"
    ),
    "About Female Foundry": (
        "Opening Female Foundry in a new tab.<br><br>"
        "<a href='https://www.femalefoundry.co/' target='_top' rel='noopener noreferrer' class='chat-link-btn'>Open Female Foundry</a>"
    ),
}

# --- MODELS ---

class ChatRequest(BaseModel):
    session_id: str
    message: str

class SessionResponse(BaseModel):
    session_id: str
    messages: List[Dict[str, str]]
    options: List[str]
    stage: str

class SessionSnapshot(BaseModel):
    session_id: str
    visitor_name: str | None
    stage: str
    primary_choice: str | None
    history: List[Tuple[str, str]]
    options: List[str]

# --- HELPERS ---

def format_bot_message(text: str) -> str:
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    if not lines:
        return ""

    bullet_mode = any(line[:1] in {"•", "-", "*"} for line in lines)
    if bullet_mode:
        cleaned = []
        for line in lines:
            if line[:1] in {"•", "-", "*"}:
                line = line[1:].strip()
            cleaned.append(line)
        items = "".join(f"<li>{line}</li>" for line in cleaned)
        return f"<ul class='bot-list'>{items}</ul>"

    # Join with <br> for non-bullet multi-line responses
    return "<br>".join(lines)

class SessionState:
    def __init__(self, session_id: str):
        self.session_id = session_id
        self.stage = "ask_name"
        self.visitor_name: str | None = None
        self.primary_choice: str | None = None
        self.history: List[Tuple[str, str]] = []
        # Initial greeting happens on frontend now, or we can send it. 
        # But frontend "Hey what's your name" is a static view. 
        # So the first interaction is User sending Name.
        
    def to_initial_response(self) -> SessionResponse:
        return SessionResponse(
            session_id=self.session_id,
            messages=[],
            options=[],
            stage=self.stage,
        )

SESSIONS: Dict[str, SessionState] = {}

def create_session() -> SessionState:
    session_id = uuid4().hex
    state = SessionState(session_id)
    SESSIONS[session_id] = state
    return state

def get_session(session_id: str) -> SessionState:
    state = SESSIONS.get(session_id)
    if not state:
        raise HTTPException(status_code=404, detail="Session not found")
    return state

def keyword_match(text: str, mapping: Dict[str, str]) -> str | None:
    text_lower = text.lower()
    for keyword, value in mapping.items():
        pattern = re.escape(keyword.lower())
        if re.search(pattern, text_lower):
            return value
    return None

def deliver_info(state: SessionState, choice: str) -> SessionResponse:
    info = INFO_MAP.get(choice)
    
    # Special handling for "Key Findings" button inside "Key Insights" flow
    if choice == "Key Findings" and state.stage == "menu_secondary":
         info = INFO_MAP.get("Key Findings")

    if not info:
        return respond(state, [format_bot_message("I don’t have that snippet yet—try another option.")], [])
    
    formatted = format_bot_message(info)
    follow_up = format_bot_message("Anything else you'd like to explore?")
    
    state.history.append(("bot", formatted))
    state.history.append(("bot", follow_up))
    
    # If they selected a SECONDARY option, keep them in the secondary menu so the 6 options remain visible.
    current_primary = state.primary_choice
    secondary_opts = SECONDARY_OPTIONS.get(current_primary, []) if current_primary else []
    is_secondary_choice = bool(current_primary and choice in secondary_opts)

    if is_secondary_choice:
        state.stage = "menu_secondary"
        return SessionResponse(
            session_id=state.session_id,
            messages=[{"role": "bot", "content": formatted}, {"role": "bot", "content": follow_up}],
            options=secondary_opts,
            stage=state.stage,
        )

    # Otherwise (primary info), reset to primary menu after delivering info
    state.stage = "menu_primary"
    state.primary_choice = None

    return SessionResponse(
        session_id=state.session_id,
        messages=[{"role": "bot", "content": formatted}, {"role": "bot", "content": follow_up}],
        options=PRIMARY_OPTIONS,
        stage=state.stage,
    )


def _process_primary_selection(state: SessionState, match: str | None) -> SessionResponse:
    if not match:
        fallback = format_bot_message("I'm not sure about that. Pick a topic from the dashboard or menu.")
        return respond(state, [fallback], PRIMARY_OPTIONS)

    sub_opts = SECONDARY_OPTIONS.get(match)
    state.primary_choice = match
    if sub_opts:
        state.stage = "menu_secondary"
        intro_text = INFO_MAP.get(match, f"Let's explore {match}.")
        formatted_intro = format_bot_message(intro_text)
        return respond(state, [formatted_intro], sub_opts)

    # no secondary options: deliver info and return to primary menu
    state.stage = "menu_primary"
    return deliver_info(state, match)

def respond(state: SessionState, responses: List[str], options: List[str]) -> SessionResponse:
    for response in responses:
        state.history.append(("bot", response))
    return SessionResponse(
        session_id=state.session_id,
        messages=[{"role": "bot", "content": response} for response in responses],
        options=options,
        stage=state.stage,
    )

def reset_session(state: SessionState) -> SessionResponse:
    SESSIONS[state.session_id] = SessionState(state.session_id)
    return SESSIONS[state.session_id].to_initial_response()

def handle_message(state: SessionState, message: str) -> SessionResponse:
    trimmed = message.strip()
    if not trimmed:
        return respond(state, [format_bot_message("Say something or choose one of the suggestions below.")], _current_options(state))

    if trimmed.lower() in {"reset", "start over", "restart"}:
        return reset_session(state)

    state.history.append(("user", trimmed))

    # Global primary override: if user clicks any primary option, always treat it as a primary selection
    if state.stage != "ask_name":
        global_primary_match = None
        for opt in PRIMARY_OPTIONS:
            if trimmed.lower() == opt.lower():
                global_primary_match = opt
                break
        if not global_primary_match:
            global_primary_match = keyword_match(trimmed, PRIMARY_KEYWORDS)
        if global_primary_match:
            state.stage = "menu_primary"
            state.primary_choice = None
            return _process_primary_selection(state, global_primary_match)

    # 1. HANDLE NAME INPUT
    if state.stage == "ask_name":
        safe_name = html.escape(trimmed.title())
        state.visitor_name = safe_name
        state.stage = "menu_primary"
        
        # We don't send a message here necessarily, because the Frontend will show the Dashboard.
        # But if they are in chat mode, we might want to say something.
        # However, the requirement is: Name -> Dashboard.
        # So we just return the PRIMARY_OPTIONS.
        return SessionResponse(
            session_id=state.session_id,
            messages=[], 
            options=PRIMARY_OPTIONS,
            stage=state.stage
        )

    # 2. HANDLE PRIMARY SELECTION (From Dashboard or Chat)
    if state.stage == "menu_primary":
        # Exact match check
        match = None
        for opt in PRIMARY_OPTIONS:
            if trimmed.lower() == opt.lower():
                match = opt
                break
        
        if not match:
            match = keyword_match(trimmed, PRIMARY_KEYWORDS)

        return _process_primary_selection(state, match)

    # 3. HANDLE SECONDARY SELECTION
    if state.stage == "menu_secondary":
        # If no current primary_choice, treat this message as a primary selection
        if not state.primary_choice:
            state.stage = "menu_primary"
            return _process_primary_selection(state, keyword_match(trimmed, PRIMARY_KEYWORDS) or trimmed)

        # If user selects a different primary while in secondary, switch context first
        primary_match = None
        for opt in PRIMARY_OPTIONS:
            if trimmed.lower() == opt.lower():
                primary_match = opt
                break
        if not primary_match:
            primary_match = keyword_match(trimmed, PRIMARY_KEYWORDS)

        if primary_match:
            # reset to primary flow before processing the new primary choice
            state.stage = "menu_primary"
            state.primary_choice = None
            return _process_primary_selection(state, primary_match)

        # Otherwise stay in current primary secondary flow
        primary = state.primary_choice
        options = SECONDARY_OPTIONS.get(primary, [])

        match = None
        for opt in options:
            if trimmed.lower() == opt.lower():
                match = opt
                break
                
        if not match:
            match = keyword_match(trimmed, SECONDARY_KEYWORDS)

        if match:
            return deliver_info(state, match)
            
        # If no match at all, fall back to primary menu to avoid getting stuck
        state.stage = "menu_primary"
        state.primary_choice = None
        return respond(state, [format_bot_message("Please choose one of the available options.")], PRIMARY_OPTIONS)

    state.stage = "menu_primary"
    return respond(state, ["Let's start over."], PRIMARY_OPTIONS)


def _current_options(state: SessionState) -> List[str]:
    if state.stage == "menu_primary":
        return PRIMARY_OPTIONS
    if state.stage == "menu_secondary" and state.primary_choice:
        return SECONDARY_OPTIONS.get(state.primary_choice, [])
    return []


app = FastAPI(title="Female Foundry Chatbot")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/session", response_model=SessionResponse)
def start_session() -> SessionResponse:
    state = create_session()
    return state.to_initial_response()

@app.get("/api/session/{session_id}", response_model=SessionSnapshot)
def get_session_snapshot(session_id: str) -> SessionSnapshot:
    state = get_session(session_id)
    return SessionSnapshot(
        session_id=state.session_id,
        visitor_name=state.visitor_name,
        stage=state.stage,
        primary_choice=state.primary_choice,
        history=state.history,
        options=_current_options(state),
    )

@app.post("/api/session/{session_id}/reset", response_model=SessionResponse)
def reset(session_id: str) -> SessionResponse:
    state = get_session(session_id)
    return reset_session(state)

@app.post("/api/chat", response_model=SessionResponse)
def chat(request: ChatRequest) -> SessionResponse:
    state = get_session(request.session_id)
    return handle_message(state, request.message)

app.mount("/", StaticFiles(directory="frontend", html=True), name="frontend")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
