# Fix SSL Certificate - Make HTTPS Work

## The Problem
The domain `srv1079042.hstgr.cloud` is showing "Your connection is not private" because there's no valid SSL certificate.

## Quick Fix - Set Up SSL Certificate

**SSH into your VPS and run these commands:**

### 1. Install Certbot (if not already installed)
```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx -y
```

### 2. Get SSL Certificate for Your Domain
```bash
sudo certbot --nginx -d srv1079042.hstgr.cloud
```

This will:
- Automatically get a certificate from Let's Encrypt
- Configure Nginx to use HTTPS
- Set up automatic renewal

**During the setup, it will ask:**
- Email address (for renewal notices) - enter your email
- Agree to terms - type `Y`
- Share email with EFF - type `Y` or `N` (your choice)
- Redirect HTTP to HTTPS - choose `2` (Redirect)

### 3. Test the Certificate
```bash
sudo certbot renew --dry-run
```

### 4. Verify Nginx Configuration
```bash
sudo nginx -t
sudo systemctl reload nginx
```

### 5. Test in Browser
After this, `https://srv1079042.hstgr.cloud` should work with a valid certificate!

## If Certbot Fails

If certbot can't verify the domain, make sure:
1. DNS is resolving: `nslookup srv1079042.hstgr.cloud` should return your IP
2. Port 80 is open: `sudo ufw allow 80/tcp`
3. Port 443 is open: `sudo ufw allow 443/tcp`
4. Nginx is running: `sudo systemctl status nginx`

## Manual Nginx SSL Configuration (if needed)

If certbot doesn't work automatically, you can manually configure:

```bash
sudo nano /etc/nginx/sites-available/femalefoundry
```

Add SSL configuration:
```nginx
server {
    listen 80;
    listen [::]:80;
    server_name srv1079042.hstgr.cloud;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name srv1079042.hstgr.cloud;

    ssl_certificate /etc/letsencrypt/live/srv1079042.hstgr.cloud/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/srv1079042.hstgr.cloud/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:8100;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Then:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

## Quick One-Liner Fix

Run this to set up SSL automatically:
```bash
sudo apt update && sudo apt install certbot python3-certbot-nginx -y && sudo certbot --nginx -d srv1079042.hstgr.cloud
```

Follow the prompts, and you're done!

