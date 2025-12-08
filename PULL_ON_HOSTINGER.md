# Update Chatbot on Hostinger VPS

## Quick Update Commands

Run these commands on your Hostinger VPS (via SSH):

```bash
cd ~/female-foundry-chatbot
git pull origin main
sudo systemctl restart femalefoundry
sudo systemctl status femalefoundry
```

## What This Does

1. **`git pull origin main`** - Downloads the latest code from GitHub (including smaller font size fixes)
2. **`sudo systemctl restart femalefoundry`** - Restarts the chatbot service to use the new code
3. **`sudo systemctl status femalefoundry`** - Verifies the service is running correctly

## Verify Files Are Updated

After pulling, check that the files have the latest changes:

```bash
cd ~/female-foundry-chatbot
grep "font-size: 0.82rem" frontend/styles.css
```

If you see the line, the files are updated!

## Clear Browser Cache

After updating on the server, **hard refresh your browser** to see the changes:
- **Mac:** `Cmd + Shift + R`
- **Windows:** `Ctrl + Shift + R`

Or clear cache manually in browser settings.


