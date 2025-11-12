import streamlit as st
import json
import os
import uuid
import re
import csv
from functools import lru_cache
from pathlib import Path
from openai import OpenAI
from datetime import datetime

# Page config
st.set_page_config(
    page_title="Female Foundry Chatbot",
    page_icon="💬",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# Lightweight styling for clean layout and mobile fix
st.markdown(
    """
    <style>
        body {
            font-family: "Inter", "SF Pro Display", sans-serif;
            background: radial-gradient(circle at top, #fdf9ff 0%, #f5f7ff 45%, #f3f5f9 100%) !important;
            color: #172036;
        }
        [data-testid="stAppViewContainer"] {
            background: transparent;
        }
        [data-testid="stHeader"] {
            background: transparent;
            border-bottom: none;
        }
        .main .block-container {
            max-width: 880px;
            margin: 0 auto;
            padding: 2rem 2.5rem 6rem !important;
        }
        .ff-card {
            background: rgba(255,255,255,0.85);
            border-radius: 20px;
            padding: 1.8rem;
            box-shadow: 0 18px 40px rgba(22,29,43,0.08);
            border: 1px solid rgba(123,77,255,0.06);
            margin-bottom: 1.8rem;
        }
        .ff-card h1 {
            margin-bottom: 0.4rem;
            font-size: clamp(1.8rem, 4vw, 2.4rem);
            letter-spacing: -0.03em;
        }
        .ff-card p {
            margin: 0;
            color: #475067;
        }
        [data-testid="stChatMessage"] {
            padding: 0.35rem 0 !important;
        }
        [data-testid="stChatMessageContent"] {
            background: rgba(255,255,255,0.92);
            border-radius: 16px;
            border: 1px solid rgba(123,77,255,0.07);
            padding: 0.95rem 1.05rem;
            box-shadow: 0 16px 34px -22px rgba(18, 21, 40, 0.35);
        }
        .stChatInput textarea {
            border-radius: 18px !important;
            border: 1px solid rgba(123,77,255,0.18) !important;
            box-shadow: 0 10px 30px rgb(123 77 255 / 12%) !important;
            font-size: 1rem !important;
        }
        /* Mobile input fix */
        @media (max-width: 768px) {
            .main .block-container {
                padding: 1.5rem 1.2rem 6rem !important;
            }
            .stChatInputContainer {
                position: fixed !important;
                bottom: 16px !important;
                left: 12px !important;
                right: 12px !important;
                z-index: 9999 !important;
                background: white !important;
                padding: 12px !important;
                border-radius: 18px !important;
                box-shadow: 0 12px 40px rgba(20,21,36,0.15) !important;
            }
            .stChatInput > div {
                width: 100% !important;
            }
            [data-testid="stVerticalBlock"] {
                padding-bottom: 120px !important;
            }
            .stSidebar {
                display: none;
            }
        }
    </style>
    """,
    unsafe_allow_html=True,
)

# Initialize session state
if "messages" not in st.session_state:
    st.session_state.messages = []
if "logs" not in st.session_state:
    st.session_state.logs = []

if not st.session_state.messages:
    st.session_state.messages.append(
        {
            "role": "assistant",
            "content": (
                "Hi! I can answer questions using the Female Innovation Index survey, macro analysis, and the Dealroom order sheet.\n\n"
                "**Try asking about:**\n"
                "• VC raised by female-founded startups (2020–2024)\n"
                "• Top sectors for new female-founded companies in 2024\n"
                "• Deep tech or AI sub-sectors and their funding volumes\n"
                "• Survey findings on fundraising difficulty or innovation barriers\n"
                "• Inflation, interest rates, or IPO counts by country (2019–2024)\n"
                "• Month-by-month VC investment in Europe for 2024\n"
                "• Country-level breakdowns of funding or deal counts\n\n"
                "Just describe the metric or Dealroom identifier you need—for example, \"Show DR_FF_C_1\" or "
                "\"How many rounds did female-founded AI companies raise in 2024?\""
            ),
        }
    )

with st.container():
    st.markdown(
        '<div class="ff-card"><h1>Female Foundry Chatbot</h1><p>Ask me about the Female Innovation Index, key stats on female-founded startups, or how to get involved with Female Foundry.</p></div>',
        unsafe_allow_html=True,
    )

# Paths
DATA_DIR = Path(__file__).parent / "data"
INDEX_PATH = DATA_DIR / "index.json"
LOGS_PATH = DATA_DIR / "logs.json"
ORDER_SHEET_LOCAL = DATA_DIR / "dealroom_order_sheet.csv"
ORDER_SHEET_DOWNLOADS = Path.home() / "Downloads" / "Copy of Female Innovation Index 2025_ Dealroom Data - ORDER SHEET.csv"

# Load OpenAI client with validation
@st.cache_resource
def get_openai_client():
    """Initialize OpenAI client with proper error handling and validation."""
    api_key = st.secrets.get("OPENAI_API_KEY") or os.getenv("OPENAI_API_KEY")
    project_id = st.secrets.get("OPENAI_PROJECT_ID") or os.getenv("OPENAI_PROJECT_ID")

    if not api_key:
        st.error("⚠️ OPENAI_API_KEY not found in Streamlit Secrets or environment variables.")
        return None
    
    if not api_key.startswith("sk-"):
        st.warning("⚠️ API key format looks incorrect. Should start with 'sk-'")
        return None

    try:
        client_kwargs = {"api_key": api_key.strip(), "timeout": 30.0}
        if project_id:
            client_kwargs["project"] = project_id.strip()
        
        return OpenAI(**client_kwargs)
    except Exception as e:
        st.error(f"⚠️ Failed to initialize OpenAI client: {str(e)[:100]}")
        return None

openai_client = get_openai_client()

# Load data
@st.cache_data
def load_index():
    try:
        with open(INDEX_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
    except FileNotFoundError:
        data = []

    # Extend with Dealroom order sheet entries if available
    data.extend(load_dealroom_entries())
    return data

def load_logs():
    try:
        with open(LOGS_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        return []

def save_log(entry):
    # Try to save log, but don't fail if we can't write to file (e.g., on Streamlit Cloud)
    try:
        logs = load_logs()
        logs.append(entry)
        with open(LOGS_PATH, "w", encoding="utf-8") as f:
            json.dump(logs, f, indent=2)
    except Exception as e:
        # Silently fail - file writing is optional, logs are in session state anyway
        pass


@lru_cache()
def load_dealroom_entries():
    """Parse the Dealroom order sheet CSV into FAQ-style entries."""
    entries = []
    for path in (ORDER_SHEET_LOCAL, ORDER_SHEET_DOWNLOADS):
        if not path.exists():
            continue
        try:
            with path.open("r", encoding="utf-8-sig") as csv_file:
                reader = csv.DictReader(csv_file)
                for row in reader:
                    entry = format_order_sheet_row(row)
                    if entry:
                        entries.append(entry)
        except Exception as exc:
            st.warning(f"Could not read Dealroom order sheet ({path.name}): {exc}")
        else:
            break  # stop after first successful read
    return entries


def format_order_sheet_row(row: dict):
    identifier = (row.get("Identifyer") or "").strip()
    description = (row.get("Description (FF)") or "").strip()

    if not identifier and not description:
        return None

    def clean(value: str):
        if not value:
            return None
        return value.replace("\r\n", "\n").replace("\r", "\n").strip()

    info_lines = []
    field_mapping = [
        ("Identifier", "Identifyer"),
        ("Section", "Section"),
        ("Status", "Status"),
        ("Female Foundry brief", "Description (FF)"),
        ("Dealroom description", "Description (DR)"),
        ("Expected output", "How the output looks like"),
        ("Dealroom query", "DR Query"),
        ("Link to Dealroom data", "Link o DR data"),
        ("Embed code", "Embed Code"),
        ("FF question", "Comment / Question to FF"),
        ("FF answer (Dec 2024)", "Answer FF (12.2024)"),
        ("Dealroom comment", "Comment DR (first export)"),
        ("FF answer (Jan 2025)", "Answer FF 20.01.2025"),
    ]

    for label, column in field_mapping:
        value = clean(row.get(column))
        if value:
            info_lines.append(f"{label}: {value}")

    if not info_lines:
        return None

    tags = ["dealroom"]
    section = clean(row.get("Section"))
    status = clean(row.get("Status"))
    if section:
        tags.extend([token for token in re.split(r"[+/,\s]+", section.lower()) if token])
    if status:
        tags.extend([token for token in re.split(r"[+/,\s]+", status.lower()) if token])

    title = description or identifier or "Dealroom data insight"
    question = f"What does the Dealroom order sheet cover for '{title}'?"

    entry_id = identifier.lower().replace(" ", "_") if identifier else f"dealroom_{abs(hash(title))}"

    return {
        "id": entry_id,
        "title": title,
        "question": question,
        "answer": "\n".join(info_lines),
        "tags": tags,
    }


# Scoring function
def score_entry(entry, message):
    tokens = re.sub(r"[^a-z0-9\s]", " ", message.lower()).split()
    tokens = [t for t in tokens if t]
    alt_q = " ".join(entry.get("altQuestions", []))
    haystack = (
        f"{entry.get('title', '')} {entry.get('question', '')} "
        f"{entry.get('answer', '')} {' '.join(entry.get('tags', []))} {alt_q}"
    ).lower()
    hits = sum(1 for token in tokens if token in haystack)
    return hits / max(len(tokens), 1)

def find_relevant_entries(message, limit=3):
    index = load_index()
    scored = [
        {"entry": entry, "score": score_entry(entry, message)}
        for entry in index
    ]
    scored.sort(key=lambda x: x["score"], reverse=True)
    return [x for x in scored[:limit] if x["score"] > 0]

def build_prompt(message, entries):
    context = "\n\n".join(
        f"Title: {e['entry']['title']}\nQuestion: {e['entry']['question']}\nAnswer: {e['entry']['answer']}\nTags: {', '.join(e['entry']['tags'])}"
        for e in entries
    )
    
    return [
        {
            "role": "system",
            "content": (
                "You are the Female Foundry assistant. Always use the provided context and give the closest relevant figure or summary, "
                "even if the exact number is not present. If no relevant facts exist at all, only then suggest contacting a human. "
                "Respect privacy and never request sensitive personal data."
            )
        },
        {
            "role": "assistant",
            "content": f"Context:\n{context}" if context else "No context available."
        },
        {
            "role": "user",
            "content": message
        }
    ]

def generate_answer(message, entries, retries=2):
    """Generate answer with retry logic and fallback to FAQ matching."""
    def fallback_answer():
        if entries:
            best_entry = entries[0]["entry"]
            return f"{best_entry['answer']}\n\n_Source: {best_entry['title']}_"
        return None

    if not openai_client:
        fallback = fallback_answer()
        if fallback:
            return fallback
        return (
            "I don’t have that specific metric in my context. You can ask me about headline statistics (e.g. total funding for female-founded "
            "startups, deep tech or AI sectors, growth-stage trends, IPO activity) or request datasets from the Dealroom order sheet such as "
            "DR_FF_C_1 or DR_MC_C_5."
        )

    for attempt in range(retries + 1):
        try:
            response = openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=build_prompt(message, entries),
                temperature=0.3,
                max_tokens=500,
            )
            content = response.choices[0].message.content.strip()
            if content:
                return content
            return (
                "I don’t have that specific metric in my context. You can ask me about headline statistics (e.g. total funding for female-founded "
                "startups, deep tech or AI sectors, fundraising challenges) or request datasets from the Dealroom order sheet such as "
                "DR_FF_C_1 or DR_MC_C_5."
            )
        except Exception as e:
            error_msg = str(e).lower()
            if "api_key" in error_msg or "authentication" in error_msg or "invalid" in error_msg:
                fallback = fallback_answer()
                if fallback:
                    return fallback
                return (
                    "I don’t have that specific metric in my context. You can ask me about headline statistics (e.g. total funding for female-founded "
                    "startups, deep tech or AI sectors) or request Dealroom datasets such as DR_FF_C_1."
                )
            elif "rate limit" in error_msg or "timeout" in error_msg:
                if attempt < retries:
                    import time
                    time.sleep(1)
                    continue
                return "⏳ Rate limit reached. Please try again in a moment."

    fallback = fallback_answer()
    if fallback:
        return fallback
    return (
        "I don’t have that specific metric in my context. You can ask me about headline statistics (e.g. total funding for female-founded startups, "
        "deep tech or AI sectors, IPO counts) or request Dealroom datasets such as DR_FF_C_1 or DR_MC_C_5."
    )

# UI
st.title("💬 Female Foundry Chatbot MVP")
st.caption("Prototype conversation experience showing how a Wix widget could talk to an LLM-backed service and log data.")

# Chat interface
chat_container = st.container()

with chat_container:
    # Display chat history
    for msg in st.session_state.messages:
        with st.chat_message(msg["role"]):
            st.markdown(msg["content"])
            if "sources" in msg and msg["sources"]:
                st.caption(f"Sources: {', '.join(s['title'] for s in msg['sources'])}")

# Chat input
if prompt := st.chat_input("Ask me about the Index, privacy, or how to join the community..."):
    try:
        # Add user message
        st.session_state.messages.append({"role": "user", "content": prompt})
        with st.chat_message("user"):
            st.markdown(prompt)
        
        # Generate response
        with st.chat_message("assistant"):
            with st.spinner("Thinking..."):
                relevant_entries = find_relevant_entries(prompt)
                answer = generate_answer(prompt, relevant_entries)
                sources = [{"id": e["entry"]["id"], "title": e["entry"]["title"]} for e in relevant_entries]
                
                st.markdown(answer)
                if sources:
                    st.caption(f"Sources: {', '.join(s['title'] for s in sources)}")
            
            # Log conversation (non-blocking)
            try:
                log_entry = {
                    "id": str(uuid.uuid4()),
                    "userId": "anonymous",
                    "message": prompt,
                    "answer": answer,
                    "matchedEntries": [{"id": e["entry"]["id"], "score": e["score"]} for e in relevant_entries],
                    "timestamp": datetime.now().isoformat()
                }
                save_log(log_entry)
                st.session_state.logs.append(log_entry)
            except Exception:
                pass  # Logging is optional
            
            # Add assistant message to history
            st.session_state.messages.append({
                "role": "assistant",
                "content": answer,
                "sources": sources
            })
    except Exception as e:
        st.error(f"An error occurred: {str(e)}")
        st.info("Please try again or refresh the page.")

# Sidebar with info
with st.sidebar:
    st.header("About")
    st.info("This is a demo chatbot for Female Foundry. It uses OpenAI's API to answer questions based on the Index database.")
    
    if st.button("Clear Chat History"):
        st.session_state.messages = []
        st.rerun()
    
    st.divider()
    st.subheader("Analytics")
    st.metric("Total Conversations", len(st.session_state.logs))
    st.metric("Messages in Session", len(st.session_state.messages))

