import streamlit as st
import json
import os
import uuid
import re
from pathlib import Path
from openai import OpenAI
from datetime import datetime

# Page config
st.set_page_config(
    page_title="Female Foundry Chatbot",
    page_icon="💬",
    layout="wide",
    initial_sidebar_state="collapsed"  # Collapse sidebar on mobile
)

# Custom CSS for mobile chat input visibility
st.markdown("""
<style>
    /* Ensure chat input is visible on mobile - positioned higher */
    @media (max-width: 768px) {
        /* Fix the chat input container */
        .stChatInputContainer {
            position: fixed !important;
            bottom: 20px !important;
            left: 10px !important;
            right: 10px !important;
            z-index: 9999 !important;
            background: white !important;
            padding: 10px !important;
            border-radius: 25px !important;
            box-shadow: 0 -4px 20px rgba(0,0,0,0.15) !important;
            max-width: calc(100% - 20px) !important;
        }
        
        /* Ensure the input itself is visible */
        .stChatInput > div {
            width: 100% !important;
        }
        
        /* Add padding to main content so messages don't get hidden */
        .main .block-container {
            padding-bottom: 140px !important;
        }
        
        /* Make sure the app container has proper spacing */
        .stApp {
            padding-bottom: 100px !important;
        }
        
        /* Hide sidebar on mobile by default */
        .stSidebar {
            display: none !important;
        }
        
        /* Ensure chat messages are scrollable */
        [data-testid="stVerticalBlock"] {
            padding-bottom: 100px !important;
        }
    }
    
    /* For very small screens (phones in portrait) */
    @media (max-width: 480px) {
        .stChatInputContainer {
            bottom: 10px !important;
            left: 5px !important;
            right: 5px !important;
            max-width: calc(100% - 10px) !important;
        }
        .main .block-container {
            padding-bottom: 120px !important;
        }
    }
</style>
""", unsafe_allow_html=True)

# Initialize session state
if "messages" not in st.session_state:
    st.session_state.messages = []
if "logs" not in st.session_state:
    st.session_state.logs = []

# Paths
DATA_DIR = Path(__file__).parent / "data"
INDEX_PATH = DATA_DIR / "index.json"
LOGS_PATH = DATA_DIR / "logs.json"

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
            return json.load(f)
    except FileNotFoundError:
        return []

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

# Scoring function
def score_entry(entry, message):
    tokens = re.sub(r"[^a-z0-9\s]", " ", message.lower()).split()
    tokens = [t for t in tokens if t]
    haystack = f"{entry['title']} {entry['question']} {entry['answer']} {' '.join(entry['tags'])}".lower()
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
            "content": "You are the Female Foundry assistant. Answer using the provided context. If you cannot find an answer in context, suggest escalating the conversation to a human via email. Respect privacy: never request sensitive personal data."
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
    # Fallback to FAQ matching if no OpenAI client
    if not openai_client:
        best = entries[0]["entry"] if entries else None
        if best:
            return f"{best['answer']}\n\n_Source: {best['title']}_"
        return "I do not have that information yet. Would you like me to connect you with a team member at Female Foundry?"
    
    # Try OpenAI API with retries
    for attempt in range(retries + 1):
        try:
            response = openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=build_prompt(message, entries),
                temperature=0.3,
                max_tokens=500
            )
            content = response.choices[0].message.content.strip()
            if content:
                return content
            return "I could not formulate a response right now. Would you like me to escalate this to a team member?"
        except Exception as e:
            error_msg = str(e).lower()
            
            # Don't retry on authentication errors
            if "api_key" in error_msg or "authentication" in error_msg or "invalid" in error_msg:
                # Fallback to FAQ if API fails
                best = entries[0]["entry"] if entries else None
                if best:
                    return f"{best['answer']}\n\n_Source: {best['title']}_\n\n_Note: Using FAQ fallback due to API issue._"
                return "⚠️ API authentication issue. Please check your OpenAI API key in Streamlit Secrets."
            
            # Retry on rate limits or network errors
            elif "rate limit" in error_msg or "timeout" in error_msg:
                if attempt < retries:
                    import time
                    time.sleep(1)  # Wait before retry
                    continue
                return "⏳ Rate limit reached. Please try again in a moment."
            
            # Last attempt failed - use FAQ fallback
            if attempt == retries:
                best = entries[0]["entry"] if entries else None
                if best:
                    return f"{best['answer']}\n\n_Source: {best['title']}_\n\n_Note: Using FAQ fallback due to technical issue._"
                return "I ran into a technical issue. Please try again or contact support."
    
    # Should never reach here, but safety fallback
    best = entries[0]["entry"] if entries else None
    if best:
        return f"{best['answer']}\n\n_Source: {best['title']}_"
    return "I'm having trouble right now. Please try again later."

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

