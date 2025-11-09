# Female Foundry Chatbot - Streamlit MVP

A lightweight chatbot MVP demonstrating LLM integration with FAQ retrieval and conversation logging.

## 🚀 Quick Start (Local)

```bash
# Install dependencies
pip install -r requirements.txt

# Set up secrets (optional for local testing)
mkdir -p .streamlit
cp .streamlit/secrets.toml.example .streamlit/secrets.toml
# Edit .streamlit/secrets.toml and add your OPENAI_API_KEY

# Run the app
streamlit run app.py
```

Visit: http://localhost:8501

## 📦 Deploy to Streamlit Cloud

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete instructions.

**Quick version:**
1. Push code to GitHub
2. Go to https://share.streamlit.io/
3. Connect your repo
4. Add `OPENAI_API_KEY` in Streamlit Cloud Secrets
5. Get your public link!

## 📁 Project Structure

```
llm-mvp/
├── app.py                 # Main Streamlit application
├── requirements.txt        # Python dependencies
├── data/
│   ├── index.json        # FAQ/Index database
│   └── logs.json         # Conversation logs (gitignored)
├── .streamlit/
│   ├── config.toml       # Streamlit config
│   └── secrets.toml.example  # Secrets template
└── DEPLOYMENT.md         # Deployment guide
```

## ✨ Features

- Real-time chat interface
- OpenAI GPT-4o-mini integration
- FAQ retrieval from Index database
- Conversation logging
- Source attribution
- Session state management

## 🔧 Tech Stack

- **Frontend**: Streamlit
- **LLM**: OpenAI GPT-4o-mini
- **Data**: JSON files (easily replaceable with Wix Data/DB)
- **Hosting**: Streamlit Cloud (free)

## 📝 Notes

- The app uses Streamlit's built-in secrets management for API keys
- Conversation logs are saved to `data/logs.json`
- FAQ data comes from `data/index.json` (easily replaceable with Wix Data API)

