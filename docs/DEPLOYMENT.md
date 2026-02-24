# Deployment Guide

This guide covers deploying the Female Foundry Chatbot on a **Hostinger VPS** running Ubuntu with nginx as a reverse proxy.

---

## Prerequisites

- Hostinger VPS with Ubuntu 22.04 (or similar)
- SSH access to the server
- A domain name pointed at the server's IP (see [DNS & Domain](#dns--domain))
- Python 3.10+ installed on the server

---

## 1. First-time server setup

```bash
# Install Python and pip if not present
sudo apt update && sudo apt install -y python3 python3-pip python3-venv nginx certbot python3-certbot-nginx

# Clone the repository
git clone <repo-url> /var/www/female-foundry-chatbot
cd /var/www/female-foundry-chatbot

# Create a virtual environment and install dependencies
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

---

## 2. Environment variables

No environment variables are required to run the app. If you add LLM integration later, copy `.env.example` to `.env` and fill in the required values.

---

## 3. Start the server

### Manual start (testing only)

```bash
cd /var/www/female-foundry-chatbot
source venv/bin/activate
uvicorn server:app --host 0.0.0.0 --port 8000
```

### Systemd service (recommended for production)

Create `/etc/systemd/system/ff-chatbot.service`:

```ini
[Unit]
Description=Female Foundry Chatbot
After=network.target

[Service]
User=www-data
WorkingDirectory=/var/www/female-foundry-chatbot
ExecStart=/var/www/female-foundry-chatbot/venv/bin/uvicorn server:app --host 127.0.0.1 --port 8000
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Enable and start the service:

```bash
sudo systemctl daemon-reload
sudo systemctl enable ff-chatbot
sudo systemctl start ff-chatbot
sudo systemctl status ff-chatbot
```

---

## 4. nginx reverse proxy

Create `/etc/nginx/sites-available/ff-chatbot`:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/ff-chatbot /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 5. SSL certificate (Let's Encrypt)

```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

Certbot will automatically update the nginx config to redirect HTTP → HTTPS and install the certificate. Certificates auto-renew via a systemd timer — no manual action needed.

To verify auto-renewal works:

```bash
sudo certbot renew --dry-run
```

---

## 6. DNS & domain

Point your domain to the server's IP address:

| Type | Name | Value |
|------|------|-------|
| A    | @    | `<server-IP>` |
| A    | www  | `<server-IP>` |

DNS propagation typically takes 5–30 minutes. Use `dig your-domain.com` to confirm.

---

## 7. Pulling updates

```bash
cd /var/www/female-foundry-chatbot
git pull origin main
sudo systemctl restart ff-chatbot
```

If Python dependencies changed:

```bash
source venv/bin/activate
pip install -r requirements.txt
sudo systemctl restart ff-chatbot
```

---

## 8. Troubleshooting checklist

| Symptom | Check |
|---------|-------|
| 502 Bad Gateway | Is the uvicorn process running? `sudo systemctl status ff-chatbot` |
| 502 after deploy | Did you restart the service? `sudo systemctl restart ff-chatbot` |
| Site not loading | Is nginx running? `sudo systemctl status nginx` |
| nginx config error | `sudo nginx -t` to validate config |
| SSL not working | `sudo certbot certificates` to check certificate status |
| DNS not resolving | Wait for propagation; use `dig your-domain.com` to check |
| Port 8000 blocked | Ensure the firewall allows nginx (port 80/443): `sudo ufw allow 'Nginx Full'` |
| Changes not visible | Hard-refresh browser (Ctrl+Shift+R) to bypass cache |
| Logs | `sudo journalctl -u ff-chatbot -f` for live app logs |
