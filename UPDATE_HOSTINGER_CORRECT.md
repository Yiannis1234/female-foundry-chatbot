# Correct Commands to Update Chatbot on Hostinger

## The Issue
The chatbot code is in `~/female-foundry-chatbot/` NOT `~/female-foundry-chatbot/llm-mvp/`

## Correct Update Commands

**SSH into your VPS and run:**

```bash
# 1. Go to the correct directory
cd ~/female-foundry-chatbot

# 2. Pull latest changes (fixes divergent branches)
git fetch origin
git reset --hard origin/main

# 3. Activate virtual environment
source .venv/bin/activate

# 4. Install any new dependencies
pip install -r requirements.txt

# 5. Restart the chatbot service
sudo systemctl restart femalefoundry

# 6. Check if it's running
sudo systemctl status femalefoundry
```

## All in One Command

```bash
cd ~/female-foundry-chatbot && git fetch origin && git reset --hard origin/main && source .venv/bin/activate && pip install -r requirements.txt && sudo systemctl restart femalefoundry && sudo systemctl status femalefoundry
```

## Verify Frontend Files Are Updated

After pulling, check if frontend files are there:

```bash
cd ~/female-foundry-chatbot
ls -la frontend/
```

You should see:
- `frontend/index.html`
- `frontend/app.js`
- `frontend/styles.css`

If they're there, the frontend is updated! The service restart will serve the new files.



