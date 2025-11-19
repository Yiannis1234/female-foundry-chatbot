# Troubleshooting Hostinger VPS - DNS Error

## The Problem
You're seeing `DNS_PROBE_FINISHED_NXDOMAIN` when accessing `srv1079042.hstgr.cloud`. This means DNS can't resolve the domain.

## Quick Fix Steps

**SSH into your VPS and run these commands:**

### 1. Check if the service is running:
```bash
sudo systemctl status femalefoundry
```

If it's not running, start it:
```bash
sudo systemctl start femalefoundry
```

### 2. Check if Nginx is running:
```bash
sudo systemctl status nginx
```

If it's not running, start it:
```bash
sudo systemctl start nginx
```

### 3. Check Nginx configuration:
```bash
sudo nginx -t
```

This will tell you if there are any configuration errors.

### 4. Check if the chatbot is responding on port 8100:
```bash
curl http://localhost:8100
```

If this works, the chatbot is running. If not, check the service logs:
```bash
sudo journalctl -u femalefoundry -n 50
```

### 5. Check Nginx server blocks:
```bash
ls -la /etc/nginx/sites-enabled/
cat /etc/nginx/sites-enabled/femalefoundry
```

### 6. Test the IP address directly:
```bash
# First, find your VPS IP address
curl ifconfig.me
```

Then try accessing `http://YOUR_IP_ADDRESS` in your browser. If this works, the issue is DNS, not the server.

### 7. Reload Nginx after checking:
```bash
sudo systemctl reload nginx
```

## Common Issues

### Issue 1: Service not running
**Fix:**
```bash
cd ~/female-foundry-chatbot/llm-mvp
source .venv/bin/activate
sudo systemctl restart femalefoundry
sudo systemctl status femalefoundry
```

### Issue 2: Nginx not configured correctly
**Check the Nginx config:**
```bash
sudo nano /etc/nginx/sites-available/femalefoundry
```

Make sure it has:
```nginx
server {
    listen 80;
    listen [::]:80;
    server_name srv1079042.hstgr.cloud;

    location / {
        proxy_pass http://127.0.0.1:8100;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

Then:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

### Issue 3: DNS not configured in Hostinger
- Go to your Hostinger control panel
- Check DNS settings for `srv1079042.hstgr.cloud`
- Make sure there's an A record pointing to your VPS IP address

### Issue 4: Firewall blocking
```bash
# Check if port 80 and 443 are open
sudo ufw status
# If needed, allow them:
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

## Quick Test Commands

Run these in order:
```bash
# 1. Is the chatbot running?
curl http://localhost:8100

# 2. Is Nginx running?
curl http://localhost

# 3. What's the VPS IP?
curl ifconfig.me

# 4. Check all services
sudo systemctl status femalefoundry nginx
```

## If Nothing Works

1. **Check Hostinger DNS settings** - The domain might not be properly configured
2. **Try accessing by IP** - If IP works but domain doesn't, it's a DNS issue
3. **Check Hostinger support** - They might need to configure the subdomain

