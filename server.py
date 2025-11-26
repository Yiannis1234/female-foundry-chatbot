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
with DATA_PATH.open("r", encoding="utf-8") as f:
    CONTENT = json.load(f)

PRIMARY_OPTIONS = [
    "What is the Female Innovation Index?",
    "I want to dive into the Index data",
    "I want to learn about the team",
    "I want to learn about Methodology",
    "I want to learn about Female Foundry",
]

SECONDARY_OPTIONS: Dict[str, List[str]] = {
    "What is the Female Innovation Index?": [],
    "I want to dive into the Index data": ["Headline metrics", "Deep Tech & AI", "Using the Index"],
    "I want to learn about the team": [],
    "I want to learn about Methodology": [],
    "I want to learn about Female Foundry": ["AI Visionaries", "AI Hustle", "Sunday Newsletter"],
}

PRIMARY_KEYWORDS: Dict[str, str] = {
    "index": "What is the Female Innovation Index?",
    "what is": "What is the Female Innovation Index?",
    "data": "I want to dive into the Index data",
    "stats": "I want to dive into the Index data",
    "numbers": "I want to dive into the Index data",
    "team": "I want to learn about the team",
    "people": "I want to learn about the team",
    "methodology": "I want to learn about Methodology",
    "how": "I want to learn about Methodology",
    "female foundry": "I want to learn about Female Foundry",
    "about": "I want to learn about Female Foundry",
}

SECONDARY_KEYWORDS: Dict[str, str] = {
    "headline": "Headline metrics",
    "stat": "Headline metrics",
    "metrics": "Headline metrics",
    "deep tech": "Deep Tech & AI",
    "ai": "Deep Tech & AI",
    "using": "Using the Index",
    "visionaries": "AI Visionaries",
    "hustle": "AI Hustle",
    "newsletter": "Sunday Newsletter",
}

INFO_MAP: Dict[str, str] = {
    "What is the Female Innovation Index?": (
        "The Female Innovation Index is an annual analysis of over 150,000 European companies. "
        "It tracks funding, growth, and trends in female-led innovation across the continent."
    ),
    "I want to learn about the team": (
        "Sure, every year it takes a village to get the Index in place. Meet the people behind this edition.<br><br>"
        "<a href='https://www.femalefoundry.co/team' target='_blank' class='chat-link-btn'>Meet the Team</a>"
    ),
    "I want to learn about Methodology": (
        "Our methodology involves a rigorous analysis of public and private data sources to map the landscape of female entrepreneurship.<br><br>"
        "<a href='https://www.femalefoundry.co/' target='_blank' class='chat-link-btn'>Meet the Sponsors & Partners</a>"
    ),
    "I want to learn about Female Foundry": (
        "Female Foundry is a network of over 7,000 founders, investors, and operators. We run programs like AI Visionaries and AI Hustle.<br><br>"
        "<a href='https://www.femalefoundry.co/' target='_blank' class='chat-link-btn'>Learn more about Female Foundry</a>"
    ),
    "Headline metrics": (
        "• €5.76B raised by female-founded startups in Europe during 2024 (1,305 deals across 1,196 companies).\n"
        "• Represents roughly 12% of all European VC; deep tech attracts about one-third of that capital.\n"
        "• The Female Innovation Index aggregates 1,200+ survey responses and tracks 145k+ companies."
    ),
    "Deep Tech & AI": (
        "• Deep tech companies capture roughly one-third of the capital raised by female-founded startups.\n"
        "• Data & AI founders cite funding (67 mentions) and slow adoption (47) as top bottlenecks.\n"
        "• Health & life-science founders echo funding, adoption, and economic uncertainty challenges."
    ),
    "Using the Index": (
        "• Use Dealroom exports DR_FF_C_1 (female-founded VC) and DR_MC_C_5 (monthly capital) for charts.\n"
        "• Funnel views reveal drop-off points across awareness, acceleration, and funding.\n"
        "• Start from the 2025 Index landing page for methodology and download links."
    ),
    "AI Visionaries": (
        "• Female Foundry’s AI incubator with Google Cloud for frontier AI founders.\n"
        "• ‘Visit AI Visionaries’ shows cohorts, mentors, curriculum, and application windows.\n"
        "• Offers tailored GTM support, mentor office hours, and showcase opportunities."
    ),
    "AI Hustle": (
        "• Free monthly 1-hour clinic with Agata Nowicka (up to three founders).\n"
        "• Tap the homepage ‘Sign Up’ CTA to request a slot.\n"
        "• Ideal for quick GTM troubleshooting, warm intros, and accountability."
    ),
    "Sunday Newsletter": (
        "• Weekly roundup covering funding news, founder tactics, and ecosystem signals.\n"
        "• Use the homepage ‘Read’ button to browse the latest edition or subscribe.\n"
        "• Designed for female founders, operators, and allies tracking European venture."
    ),
}


class ChatRequest(BaseModel):
    session_id: str
    message: str


class SessionResponse(BaseModel):
    session_id: str
    messages: List[Dict[str, str]]
    options: List[str]
    stage: str


def format_bot_message(text: str) -> str:
    # Split by newlines to handle bullet points, but respect <br> tags in HTML strings
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    if not lines:
        return ""

    bullet_mode = len(lines) > 1 or any(line[:1] in {"•", "-", "*"} for line in lines)
    if bullet_mode:
        cleaned = []
        for line in lines:
            if line[:1] in {"•", "-", "*"}:
                line = line[1:].strip()
            # We trust the content from INFO_MAP, so we don't escape it here.
            # Dynamic user input should be escaped BEFORE calling this function.
            cleaned.append(line)
        items = "".join(f"<li>{line}</li>" for line in cleaned)
        return f"<ul class='bot-list'>{items}</ul>"

    # For single lines (which may contain HTML like <br> or <a>), return as-is.
    return lines[0]


class SessionState:
    def __init__(self, session_id: str):
        self.session_id = session_id
        self.stage = "ask_name"
        self.visitor_name: str | None = None
        self.primary_choice: str | None = None
        self.history: List[Tuple[str, str]] = []
        opening = format_bot_message("Hi! I’m the Female Foundry assistant. What’s your name?")
        self.history.append(("bot", opening))

    def to_initial_response(self) -> SessionResponse:
        return SessionResponse(
            session_id=self.session_id,
            messages=[{"role": role, "content": content} for role, content in [self.history[-1]]],
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
    if not info:
        return respond(state, [format_bot_message("I don’t have that snippet yet—try another option.")], PRIMARY_OPTIONS)
    formatted = format_bot_message(info)
    follow_up = format_bot_message("Anything else you'd like to explore?")
    state.history.append(("bot", formatted))
    state.history.append(("bot", follow_up))
    state.stage = "menu_primary"
    state.primary_choice = None
    return SessionResponse(
        session_id=state.session_id,
        messages=[{"role": "bot", "content": formatted}, {"role": "bot", "content": follow_up}],
        options=PRIMARY_OPTIONS,
        stage=state.stage,
    )


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

    if trimmed.lower() in {"reset", "start over"}:
        return reset_session(state)

    state.history.append(("user", trimmed))

    if state.stage == "ask_name":
        # Escape user input to prevent XSS since we removed auto-escaping in format_bot_message
        safe_name = html.escape(trimmed.title())
        state.visitor_name = safe_name
        state.stage = "menu_primary"
        responses = [
            format_bot_message(f"Nice to meet you, {state.visitor_name}! Choose what you’d like to explore:"),
        ]
        return respond(state, responses, PRIMARY_OPTIONS)

    if state.stage == "menu_primary":
        match = match_option(trimmed, PRIMARY_OPTIONS)
        if not match:
            keyword_hit = keyword_match(trimmed, PRIMARY_KEYWORDS)
            if keyword_hit:
                # Check if keyword hit is a branch or leaf
                sub_opts = SECONDARY_OPTIONS.get(keyword_hit, [])
                if sub_opts:
                    state.primary_choice = keyword_hit
                    state.stage = "menu_secondary"
                    options = sub_opts
                    responses = [format_bot_message(f"Great! Let’s drill into {keyword_hit}. Pick a specific topic:")]
                    return respond(state, responses, options)
                else:
                    return deliver_info(state, keyword_hit)

            secondary_hit = keyword_match(trimmed, SECONDARY_KEYWORDS)
            if secondary_hit:
                return deliver_info(state, secondary_hit)

            fallback = format_bot_message(
                "Pick one of the quick options below, or ask something specific like ‘Female founders headline stats’ or ‘Tell me about AI Hustle’."
            )
            return respond(state, [fallback], PRIMARY_OPTIONS)

        # Found a match in PRIMARY_OPTIONS
        sub_opts = SECONDARY_OPTIONS.get(match, [])
        
        if sub_opts:
            # It is a Category/Branch -> Show Sub-options
            state.primary_choice = match
            state.stage = "menu_secondary"
            options = sub_opts
            responses = [format_bot_message(f"Great! Let’s drill into {match}. Pick a specific topic:")]
            return respond(state, responses, options)
        else:
            # It is a Direct Answer/Leaf -> Show Info + Main Menu
            return deliver_info(state, match)

    if state.stage == "menu_secondary":
        primary = state.primary_choice
        options = SECONDARY_OPTIONS.get(primary, [])
        match = match_option(trimmed, options)
        if not match:
            keyword_hit = keyword_match(trimmed, SECONDARY_KEYWORDS)
            if keyword_hit:
                return deliver_info(state, keyword_hit)
            return respond(
                state,
                [format_bot_message("Choose one of the follow-up options so I can surface the right highlights.")],
                options,
            )
        return deliver_info(state, match)

    state.stage = "menu_primary"
    fallback = format_bot_message("Let's continue—pick a topic below or reset the chat (↺).")
    return respond(state, [fallback], PRIMARY_OPTIONS)


def match_option(text: str, options: List[str]) -> str | None:
    lowered = text.strip().lower()
    for option in options:
        if lowered == option.lower():
            return option
    return None


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


@app.post("/api/session/{session_id}/reset", response_model=SessionResponse)
def reset(session_id: str) -> SessionResponse:
    state = get_session(session_id)
    return reset_session(state)


@app.post("/api/chat", response_model=SessionResponse)
def chat(request: ChatRequest) -> SessionResponse:
    state = get_session(request.session_id)
    return handle_message(state, request.message)


# Serve the static front-end (index.html, JS, CSS)
app.mount("/", StaticFiles(directory="frontend", html=True), name="frontend")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
