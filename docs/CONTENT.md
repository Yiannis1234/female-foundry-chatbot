# Content Update Guide

This guide is for non-developers who need to make routine updates to the chatbot — changing response text, adding new topics, or updating external links.

All content changes require editing `server.py` and/or `frontend/app.js`, then restarting the server.

---

## Before you start

- Open `server.py` in a text editor (VS Code is recommended).
- Keep a backup copy of the file before making changes.
- After editing, restart the server: `sudo systemctl restart ff-chatbot` (on Hostinger) or `uvicorn server:app --reload` (locally).

---

## 1. Changing an existing chatbot response

All bot responses are stored in the `INFO_MAP` dictionary in `server.py`. Find the key that matches the topic you want to change and update the text.

**Example:** Changing the "Key Findings" response

```python
# Before
"Key Findings": (
    "• €5.76B raised by female-founded startups in Europe during 2024.\n"
    "• Represents roughly 12% of all European VC.\n"
    "• Deep tech companies capture roughly one-third of the capital."
),

# After (updated figures)
"Key Findings": (
    "• €6.1B raised by female-founded startups in Europe during 2025.\n"
    "• Represents roughly 13% of all European VC.\n"
    "• Deep tech companies capture roughly one-third of the capital."
),
```

**Formatting rules:**
- Lines starting with `•` are automatically displayed as a bullet list.
- Use `\n` between bullet lines.
- Use `<br><br>` for a paragraph break in non-bullet text.
- To add a button link, use: `<a href='URL' target='_top' rel='noopener noreferrer' class='chat-link-btn'>Button Text</a>`

---

## 2. Updating an external link

Links appear at the end of most responses. Find the `<a href='...'>` tag inside the relevant `INFO_MAP` entry and update the URL.

**Example:** Updating the "Methodology" link

```python
"Methodology": (
    "Our methodology involves a rigorous analysis...<br><br>"
    "<a href='https://www.femaleinnovationindex.com/methodology-2026' target='_top' ...>View Full Methodology</a>"
),
```

Dashboard card links are stored separately in `frontend/app.js` in the `OPTION_LINKS` object. Update the URL value for the relevant key:

```javascript
const OPTION_LINKS = {
  "The AI Era": "https://www.aivisionaries.co/",   // ← change this URL
  ...
};
```

---

## 3. Adding a new secondary option to an existing topic

**Example:** Adding a new sub-option "Investor Landscape" under "Fundraising trends"

**Step 1 — `server.py`, `SECONDARY_OPTIONS`:** Add the new name to the list.

```python
SECONDARY_OPTIONS = {
    "Fundraising trends": [
        "Funding Data",
        "By Country Analysis",
        "By Sector Analysis",
        "Top Funding Rounds",
        "IPOs and Exits",
        "Focus on Deeptech",
        "Investor Landscape",   # ← add here
    ],
}
```

**Step 2 — `server.py`, `INFO_MAP`:** Add the response text.

```python
"Investor Landscape": (
    "In 2026, the top 10 investors by deal count were predominantly based in the UK and US.\n"
    "• 42% of deals involved at least one female partner at the lead fund.\n"
    "<a href='https://www.femaleinnovationindex.com/investors' target='_top' rel='noopener noreferrer' class='chat-link-btn'>View Investor Data</a>"
),
```

**Step 3 — Restart the server.**

---

## 4. Adding a new primary topic (dashboard card)

Adding a new top-level card requires changes in both `server.py` and `frontend/app.js`.

**Step 1 — `server.py`, `PRIMARY_OPTIONS`:** Add the topic name.

```python
PRIMARY_OPTIONS = [
    "The AI Era",
    "Key Insights",
    "Idea",
    "Fundraising trends",
    "Behind the Index",
    "About Female Foundry",
    "Impact Stories",   # ← add here
]
```

**Step 2 — `server.py`, `INFO_MAP`:** Add the response (or intro text if it has sub-options).

```python
"Impact Stories": (
    "Inspiring stories from female founders across Europe.<br><br>"
    "<a href='https://www.femaleinnovationindex.com/stories' target='_top' rel='noopener noreferrer' class='chat-link-btn'>View Stories</a>"
),
```

**Step 3 — `frontend/app.js`, `DASHBOARD_CARD_META`:** Add the card metadata.

```javascript
"Impact Stories": {
  icon: "⭐",
  background: "#FF0000",
  description: "Read inspiring stories from female founders across Europe.",
  link: null,
},
```

**Step 4 — `frontend/app.js`, `OPTION_LINKS`** (optional): If this card should navigate directly to a URL instead of entering the chat flow, add it here.

```javascript
"Impact Stories": "https://www.femaleinnovationindex.com/stories",
```

**Step 5 — Restart the server and hard-refresh the browser.**

---

## 5. Removing a topic

1. Remove its name from `PRIMARY_OPTIONS` (or `SECONDARY_OPTIONS`) in `server.py`.
2. Remove its entry from `INFO_MAP` in `server.py`.
3. Remove its entry from `DASHBOARD_CARD_META` and `OPTION_LINKS` in `frontend/app.js`.
4. Restart the server.

---

## Tips

- Test all changes locally before deploying (see the README for local setup instructions).
- Keep the total number of primary cards at 6 — the dashboard grid is designed for an even number.
- Keep bullet responses to 3–5 items for readability on mobile screens.
