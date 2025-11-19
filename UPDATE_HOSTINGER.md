# How to Update Chatbot on Hostinger VPS

## Quick Update Steps

**SSH into your VPS and run these commands:**

```bash
# 1. Navigate to the chatbot directory
cd ~/female-foundry-chatbot/llm-mvp

# 2. Pull the latest changes from GitHub
git pull origin main

# 3. Activate the virtual environment
source .venv/bin/activate

# 4. Install any new dependencies (if requirements.txt changed)
pip install -r requirements.txt

# 5. Restart the chatbot service
sudo systemctl restart femalefoundry

# 6. Check if it's running correctly
sudo systemctl status femalefoundry
```

## What Changed

- ✅ Removed all Wix-related files (20+ files deleted)
- ✅ Updated chatbot UI with:
  - Typing indicator (three dots animation) while bot is responding
  - Improved styling to match modern chatbot design
  - Better message animations and scrolling
  - Avatar indicators for bot messages
- ✅ Cleaned repository - only production files remain

## Verify It's Working

After restarting, check:
1. Service status: `sudo systemctl status femalefoundry`
2. Test the chatbot: Visit `https://srv1079042.hstgr.cloud` in your browser
3. Check logs: `sudo journalctl -u femalefoundry -f` (press Ctrl+C to exit)

## If Something Goes Wrong

If the service fails to start:
```bash
# Check the error logs
sudo journalctl -u femalefoundry -n 50

# Manually test the server
cd ~/female-foundry-chatbot/llm-mvp
source .venv/bin/activate
uvicorn server:app --host 0.0.0.0 --port 8100
```

If you see errors, make sure:
- Python virtual environment is activated
- All dependencies are installed: `pip install -r requirements.txt`
- Port 8100 is not blocked by firewall

