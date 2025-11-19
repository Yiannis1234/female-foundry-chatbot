# Fix Nginx Configuration - Make Domain Work Again

## The Problem
Nginx is showing 404, which means it's not configured to proxy to your chatbot on port 8100.

## Quick Fix - Run These Commands on Your VPS:

### 1. Check Current Nginx Config
```bash
cat /etc/nginx/sites-enabled/femalefoundry
```

### 2. Fix the Nginx Configuration
```bash
sudo nano /etc/nginx/sites-available/femalefoundry
```

**Replace the content with this:**
```nginx
server {
    listen 80;
    listen [::]:80;
    server_name srv1079042.hstgr.cloud 147.93.85.115;

    location / {
        proxy_pass http://127.0.0.1:8100;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Save and exit:** Press `Ctrl+X`, then `Y`, then `Enter`

### 3. Test Nginx Configuration
```bash
sudo nginx -t
```

### 4. Reload Nginx
```bash
sudo systemctl reload nginx
```

### 5. Test It
```bash
curl http://localhost
```

This should return HTML (the chatbot page), not 404.

## If That Doesn't Work - Check Default Server

The issue might be that Nginx is using a default server block. Check:

```bash
ls -la /etc/nginx/sites-enabled/
cat /etc/nginx/sites-enabled/default
```

If there's a default server, either:
1. Remove it: `sudo rm /etc/nginx/sites-enabled/default`
2. Or make sure femalefoundry is the default by adding `default_server`:

```nginx
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name srv1079042.hstgr.cloud 147.93.85.115;
    ...
}
```

## Quick One-Liner Fix

If you want to do it quickly:
```bash
sudo bash -c 'cat > /etc/nginx/sites-available/femalefoundry << EOF
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name srv1079042.hstgr.cloud 147.93.85.115;

    location / {
        proxy_pass http://127.0.0.1:8100;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF'

sudo ln -sf /etc/nginx/sites-available/femalefoundry /etc/nginx/sites-enabled/femalefoundry
sudo nginx -t
sudo systemctl reload nginx
```

Then test:
```bash
curl http://localhost
```

If this returns HTML, then `http://147.93.85.115` and `http://srv1079042.hstgr.cloud` should both work!

