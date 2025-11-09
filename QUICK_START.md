# 🚀 STREAMLIT DEPLOYMENT - STEP BY STEP

## ✅ What's Ready
- ✅ Streamlit app (`app.py`)
- ✅ Requirements file (`requirements.txt`)
- ✅ Data files (`data/index.json`)
- ✅ Configuration files (`.streamlit/config.toml`)
- ✅ API key integrated (fallback in code)

---

## 📋 DEPLOYMENT STEPS

### Step 1: Test Locally (Optional but Recommended)

```bash
cd "/Users/ioannisvamvakas/FEMALE FOUNDRY/llm-mvp"

# Install Python dependencies
pip3 install streamlit openai

# Run the app
streamlit run app.py
```

Open: http://localhost:8501

---

### Step 2: Push to GitHub

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Streamlit chatbot MVP"

# Create a new repo on GitHub.com, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

**Important**: Make sure `.streamlit/secrets.toml` is NOT committed (it's in `.gitignore`)

---

### Step 3: Deploy to Streamlit Cloud

1. **Go to**: https://share.streamlit.io/
2. **Sign in** with GitHub
3. **Click**: "New app"
4. **Fill in**:
   - **Repository**: `YOUR_USERNAME/YOUR_REPO_NAME`
   - **Branch**: `main`
   - **Main file path**: `app.py`
   - **App URL**: `femalefoundry-chatbot` (or your choice)
5. **Click**: "Deploy!"

---

### Step 4: Add API Key (CRITICAL!)

**After deployment:**

1. In Streamlit Cloud dashboard → Click your app
2. Click **⚙️ Settings** → **Secrets**
3. Paste this in the secrets editor:

```toml
OPENAI_API_KEY = "your-openai-api-key-here"
```

4. Click **"Save"**
5. App auto-redeploys (takes ~30 seconds)

---

### Step 5: Get Your Public Link! 🎉

Your app will be live at:
```
https://femalefoundry-chatbot.streamlit.app
```

(Or whatever URL you chose)

---

## 🔍 Troubleshooting

**App won't start?**
- Check Streamlit Cloud logs (click "Manage app" → "Logs")
- Verify `requirements.txt` has `streamlit` and `openai`
- Make sure `app.py` is in the root directory

**API key not working?**
- Double-check it's saved in Streamlit Secrets
- Wait for app to redeploy after saving secrets
- Check logs for API errors

**Data files missing?**
- Ensure `data/index.json` is committed to GitHub
- Check file paths match your repo structure

---

## 📁 Files You Need

Make sure these are in your GitHub repo:
- ✅ `app.py` (main app)
- ✅ `requirements.txt` (dependencies)
- ✅ `data/index.json` (FAQ data)
- ✅ `.streamlit/config.toml` (config)
- ✅ `.gitignore` (excludes secrets)

---

## 🎯 That's It!

Once deployed, you'll have:
- ✅ Public URL (shareable)
- ✅ Fast hosting (Streamlit Cloud)
- ✅ Secure API key storage
- ✅ Auto-deploys on git push

**Your API key is safe** - it's stored encrypted in Streamlit Cloud Secrets, not in your code!

---

Need help? Check `DEPLOYMENT.md` for more details.

