# Fix DNS Issue - Hostinger

## The Problem
Your chatbot is running (localhost:8100 works), but `srv1079042.hstgr.cloud` doesn't resolve.

## Quick Fix - Check These:

### 1. Get Your VPS IP Address
```bash
curl ifconfig.me
```
This will show your IP. Try accessing `http://YOUR_IP` in your browser.

### 2. Check Nginx Configuration
```bash
cat /etc/nginx/sites-enabled/femalefoundry
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
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 3. Test Nginx
```bash
sudo nginx -t
sudo systemctl reload nginx
```

### 4. Check if Nginx is listening on port 80
```bash
sudo netstat -tlnp | grep :80
# or
sudo ss -tlnp | grep :80
```

### 5. Test Nginx locally
```bash
curl http://localhost
```
If this returns HTML, Nginx is working. If not, check Nginx logs:
```bash
sudo tail -f /var/log/nginx/error.log
```

## Access Options

### Option 1: Use IP Address (Works Immediately)
1. Get your IP: `curl ifconfig.me`
2. Access: `http://YOUR_IP_ADDRESS`
3. This will work right away if Nginx is configured correctly

### Option 2: Fix DNS in Hostinger
1. Go to Hostinger control panel
2. Find DNS settings for your VPS
3. Add/check A record:
   - Name: `srv1079042` (or `@` for root)
   - Type: `A`
   - Value: Your VPS IP address
   - TTL: 3600

### Option 3: Check if domain is correct
The domain might be different. Check:
```bash
hostname -f
# or
cat /etc/hostname
```

## Quick Test Commands

Run these to diagnose:
```bash
# 1. Get IP
curl ifconfig.me

# 2. Test chatbot directly
curl http://localhost:8100

# 3. Test Nginx
curl http://localhost

# 4. Check Nginx config
sudo nginx -t

# 5. Check what's listening on port 80
sudo ss -tlnp | grep :80
```

## Most Likely Solution

Since `localhost:8100` works, try accessing by IP:
1. Run: `curl ifconfig.me` to get your IP
2. Open: `http://YOUR_IP` in your browser
3. If that works, the issue is DNS configuration in Hostinger



