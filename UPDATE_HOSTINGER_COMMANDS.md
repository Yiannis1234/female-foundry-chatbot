# Commands to Update Chatbot on Hostinger VPS

## Step-by-Step Commands

**SSH into your VPS, then run these commands in order:**

### 1. Find the Correct Directory
```bash
find ~ -name "llm-mvp" -type d 2>/dev/null
```
This will show you where the chatbot directory is.

### 2. Navigate to the Chatbot Directory
```bash
cd ~/female-foundry-chatbot/llm-mvp
# OR if it's in a different location, use the path from step 1
```

### 3. Fix Divergent Branches and Pull Latest Changes
```bash
git fetch origin
git reset --hard origin/main
```
This will reset your VPS to match GitHub exactly (removes any local changes).

**OR if you want to merge instead:**
```bash
git pull origin main --no-rebase
```

### 4. Activate Virtual Environment
```bash
source .venv/bin/activate
```

### 5. Install Any New Dependencies
```bash
pip install -r requirements.txt
```

### 6. Restart the Chatbot Service
```bash
sudo systemctl restart femalefoundry
```

### 7. Check if It's Running
```bash
sudo systemctl status femalefoundry
```

## All Commands in One Block (Copy-Paste)

```bash
# Find directory (if needed)
find ~ -name "llm-mvp" -type d 2>/dev/null

# Navigate to chatbot
cd ~/female-foundry-chatbot/llm-mvp

# Pull latest changes (reset to match GitHub)
git fetch origin
git reset --hard origin/main

# Activate virtual environment
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Restart service
sudo systemctl restart femalefoundry

# Check status
sudo systemctl status femalefoundry
```

## If Directory Doesn't Exist

If `~/female-foundry-chatbot/llm-mvp` doesn't exist, clone it fresh:

```bash
cd ~
git clone https://github.com/Yiannis1234/female-foundry-chatbot.git
cd female-foundry-chatbot/llm-mvp
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
sudo systemctl restart femalefoundry
```

## Quick Update (If Everything is Already Set Up)

```bash
cd ~/female-foundry-chatbot/llm-mvp && git fetch origin && git reset --hard origin/main && source .venv/bin/activate && pip install -r requirements.txt && sudo systemctl restart femalefoundry && sudo systemctl status femalefoundry
```



