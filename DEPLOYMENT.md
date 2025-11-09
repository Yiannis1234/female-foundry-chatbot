# Streamlit Cloud Deployment Guide

## 🚀 Quick Deploy Steps

### 1. Push to GitHub
```bash
# Make sure your code is in a GitHub repository
git init
git add .
git commit -m "Initial Streamlit app"
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

### 2. Deploy to Streamlit Cloud

1. **Go to**: https://share.streamlit.io/
2. **Sign in** with your GitHub account
3. **Click**: "New app"
4. **Fill in**:
   - **Repository**: Select your GitHub repo
   - **Branch**: `main` (or your default branch)
   - **Main file path**: `app.py`
   - **App URL**: Choose a custom name (e.g., `femalefoundry-chatbot`)

5. **Click**: "Deploy!"

### 3. Add Your API Key (IMPORTANT!)

**After deployment:**

1. In your Streamlit Cloud dashboard, click on your app
2. Click **"Settings"** (⚙️ icon) → **"Secrets"**
3. Add this (replace with your actual API key):
```toml
OPENAI_API_KEY = "your-openai-api-key-here"
```
4. Click **"Save"**
5. Your app will automatically redeploy with the API key

### 4. Get Your Public Link

Once deployed, Streamlit Cloud gives you a public URL like:
```
https://femalefoundry-chatbot.streamlit.app
```

Share this link with anyone!

---

## 📋 Pre-Deployment Checklist

- [ ] Code is pushed to GitHub
- [ ] `requirements.txt` exists with all dependencies
- [ ] `app.py` is the main file
- [ ] `data/index.json` exists (FAQ data)
- [ ] `.gitignore` excludes sensitive files
- [ ] API key is ready to add to Streamlit Secrets

---

## 🧪 Test Locally First

Before deploying, test locally:

```bash
# Install dependencies
pip install -r requirements.txt

# Set up secrets (create .streamlit/secrets.toml)
mkdir -p .streamlit
cp .streamlit/secrets.toml.example .streamlit/secrets.toml
# Then edit .streamlit/secrets.toml and add your API key

# Run locally
streamlit run app.py
```

Visit: http://localhost:8501

---

## 🔒 Security Notes

- ✅ API key is stored securely in Streamlit Cloud Secrets (encrypted)
- ✅ Never commit `.streamlit/secrets.toml` to GitHub
- ✅ The hardcoded key in `app.py` is a fallback for local testing only
- ⚠️ Remove the hardcoded key before production deployment

---

## 🐛 Troubleshooting

**App won't start:**
- Check `requirements.txt` has all dependencies
- Verify `app.py` is in the root directory
- Check Streamlit Cloud logs for errors

**API key not working:**
- Verify it's added in Streamlit Cloud Secrets (Settings → Secrets)
- Check the key is correct (no extra spaces)
- App will auto-redeploy after saving secrets

**Data files missing:**
- Ensure `data/index.json` is committed to GitHub
- Check file paths in `app.py` match your structure

---

## 📊 Features

- ✅ Real-time chat interface
- ✅ OpenAI GPT-4o-mini integration
- ✅ FAQ retrieval from Index database
- ✅ Conversation logging
- ✅ Source attribution
- ✅ Session state management
- ✅ Responsive UI

---

## 🔄 Updates

After making changes:
1. Push to GitHub
2. Streamlit Cloud auto-deploys (usually takes 1-2 minutes)
3. Your public link stays the same

---

## 💰 Costs

- **Streamlit Cloud**: Free tier available (unlimited apps)
- **OpenAI API**: Pay-as-you-go (very cheap for GPT-4o-mini)
- **Total**: ~$0-5/month depending on usage

---

Need help? Check Streamlit docs: https://docs.streamlit.io/

