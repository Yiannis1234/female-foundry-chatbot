# Female Foundry Chatbot

## What this is

A guided chatbot widget embedded inside the [Female Innovation Index](https://www.femaleinnovationindex.com) website via a Wix iframe. Visitors enter their name, then explore six topic areas through clickable cards and suggestion chips. The backend is a FastAPI server that drives a rule-based conversation flow — no LLM is involved. All responses are hard-coded in `server.py`.

---

## How it works

```
Visitor opens the page
        │
        ▼
[Welcome view] — visitor types their name
        │
        ▼  POST /api/session → POST /api/chat (name)
        │
        ▼
[Dashboard view] — 6 topic cards rendered from PRIMARY_OPTIONS
        │
        ├─ Card has a direct URL (e.g. "The AI Era")
        │         └─ openExternal() navigates the parent page
        │
        └─ Card opens a chat flow (e.g. "Key Insights")
                  │
                  ▼  POST /api/chat (topic name)
                  │
                  ▼
        [Chat view] — bot intro text + sub-option chips
                  │
                  ▼  POST /api/chat (sub-option)
                  │
                  ▼
        Bot delivers bullet summary + "View" link button
        Sub-options stay visible for follow-up questions
```

Session state lives in `server.py`'s in-memory `SESSIONS` dict and is lost on server restart. The frontend persists the session ID + chat history in `sessionStorage` so the conversation survives a page reload within the same browser tab.

---

## Project structure

```
female-foundry-chatbot/
├── server.py               # FastAPI app — conversation logic + API routes
├── requirements.txt        # Python deps: fastapi, uvicorn
├── .env.example            # Environment variable template (copy to .env)
├── .gitignore
│
├── frontend/               # Static files served at "/"
│   ├── index.html          # App shell — all three views live here
│   ├── app.js              # All frontend logic (session, routing, chat, dashboard)
│   ├── styles.css          # Design system (brand colours, layout, components)
│   └── wix-widget.html     # Standalone page used when embedding in Wix
│
├── data/
│   ├── index.json          # Knowledge base (currently empty; INFO_MAP in server.py is used)
│   └── logs.json           # Reserved for future logging
│
├── icons/                  # SVG icons (sparkles, etc.)
│
└── docs/
    ├── DEPLOYMENT.md       # Full deployment guide (Hostinger, nginx, SSL, DNS)
    └── CONTENT.md          # Non-developer guide: how to update chatbot responses
```

---

## Local development

**Prerequisites:** Python 3.10+, pip

```bash
# 1. Clone the repo
git clone <repo-url>
cd female-foundry-chatbot

# 2. Install dependencies
pip install -r requirements.txt

# 3. Start the server
uvicorn server:app --reload

# 4. Open the app
# http://localhost:8000
```

The server hot-reloads on file changes. The frontend is served as static files from the `frontend/` directory.

---

## How to edit content

### Changing a chatbot response

All bot responses live in the `INFO_MAP` dict in `server.py` (around line 100).

Find the key that matches the topic you want to change and edit its value:

```python
"Key Findings": (
    "• €5.76B raised by female-founded startups in Europe during 2024.\n"
    "• Represents roughly 12% of all European VC.\n"
    "• Deep tech companies capture roughly one-third of the capital."
),
```

- Lines starting with `•` are automatically converted to a `<ul>` list by `format_bot_message()`.
- HTML is supported: you can use `<br>`, `<a class='chat-link-btn'>`, etc.
- Restart the server after editing.

### Adding a new topic

1. **`server.py` — `PRIMARY_OPTIONS`** (or `SECONDARY_OPTIONS`): add the new topic name.
2. **`server.py` — `INFO_MAP`**: add the key + response text.
3. **`frontend/app.js` — `DASHBOARD_CARD_META`**: add an entry with `icon`, `background`, and `description`.
4. **`frontend/app.js` — `OPTION_LINKS`**: add a URL if the card should navigate directly (skip chat flow).

See `docs/CONTENT.md` for a step-by-step walkthrough with examples.

---

## API reference

All endpoints are prefixed with `/api`.

### `POST /api/session`

Create a new session.

**Response:**
```json
{
  "session_id": "a3f8...",
  "messages": [],
  "options": [],
  "stage": "ask_name"
}
```

---

### `GET /api/session/{session_id}`

Retrieve full session state (used to verify a persisted session on page reload).

**Response:**
```json
{
  "session_id": "a3f8...",
  "visitor_name": "Alice",
  "stage": "menu_secondary",
  "primary_choice": "Fundraising trends",
  "history": [["user", "Fundraising trends"], ["bot", "Love it..."]],
  "options": ["Funding Data", "By Country Analysis", "..."]
}
```

---

### `POST /api/session/{session_id}/reset`

Reset the session back to `ask_name` stage. Equivalent to a fresh session with the same ID.

---

### `POST /api/chat`

Send a user message and receive the bot's reply.

**Request:**
```json
{
  "session_id": "a3f8...",
  "message": "Key Insights"
}
```

**Response:**
```json
{
  "session_id": "a3f8...",
  "messages": [
    { "role": "bot", "content": "Fantastic! Sounds like you're on the move..." }
  ],
  "options": ["Methodology", "Key Findings"],
  "stage": "menu_secondary"
}
```

---

## Wix integration

The widget is embedded in Wix via an HTML iframe pointing to `frontend/wix-widget.html`, which loads the full app. The widget communicates with the parent Wix page using `postMessage` to trigger top-frame navigation when a card link is clicked (since iframes cannot navigate `window.top` cross-origin directly).

To update the embed URL in Wix, change the `src` attribute of the iframe element in the Wix editor.

---

## Deployment

See [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) for the full guide covering:
- Hostinger VPS setup and start command
- Environment variables
- nginx reverse-proxy config
- SSL certificate (Let's Encrypt)
- DNS and domain pointing
- Troubleshooting checklist

---

## Known limitations

- **In-memory sessions only.** All session state is lost on server restart. Users whose session expires (server restart, inactivity) are transparently re-authenticated by the frontend using the saved name from `sessionStorage`.
- **No LLM.** The bot can only respond to the exact topics defined in `INFO_MAP`. Free-text input is matched against keywords only.
- **Single server process.** The in-memory `SESSIONS` dict does not scale horizontally. For multi-process or multi-instance deployments, replace it with Redis or a database.

---

## Extension roadmap

| Feature | Where to plug it in |
|---------|---------------------|
| LLM fallback | `handle_message()` in `server.py` — call OpenAI when no keyword match is found |
| Session persistence | Replace `SESSIONS` dict with Redis or PostgreSQL |
| Analytics | Log each `state.history` entry to a database or Segment |
| Live data | Replace `INFO_MAP` values with calls to Wix Data / Airtable / headless CMS |
| Branding updates | `frontend/styles.css` — CSS variables are at the top of the file |
