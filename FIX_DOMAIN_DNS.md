# Fix Domain DNS - srv1079042.hstgr.cloud

## The Problem
The domain `srv1079042.hstgr.cloud` shows `DNS_PROBE_FINISHED_NXDOMAIN` - DNS can't resolve it.
Your IP `147.93.85.115` works fine, so the server is OK. The issue is DNS configuration.

## Check DNS from Your VPS

Run this on your VPS to check if DNS is resolving:
```bash
nslookup srv1079042.hstgr.cloud
# or
dig srv1079042.hstgr.cloud
```

If it says "NXDOMAIN" or "not found", DNS is not configured.

## Fix in Hostinger Control Panel

### Option 1: Check DNS Settings in Hostinger
1. Go to your Hostinger control panel: https://hpanel.hostinger.com
2. Navigate to your VPS: `VPS` → `srv1079042`
3. Look for **DNS Settings** or **Domain Settings**
4. Check if there's an **A record** for `srv1079042.hstgr.cloud` pointing to `147.93.85.115`

### Option 2: Contact Hostinger Support
Since `srv1079042.hstgr.cloud` is a Hostinger-managed subdomain, they need to configure it:
1. Go to Hostinger support/chat
2. Ask them to: "Please configure DNS for srv1079042.hstgr.cloud to point to IP 147.93.85.115"
3. They should add an A record: `srv1079042` → `147.93.85.115`

### Option 3: Use Your Own Domain
If you have your own domain:
1. Go to your domain's DNS settings
2. Add an A record: `@` or `chatbot` → `147.93.85.115`
3. Update Nginx config to use your domain

## Temporary Workaround

While waiting for DNS, use the IP address:
- **Working link:** `http://147.93.85.115`
- This works immediately and will continue to work

## Verify DNS is Fixed

Once DNS is configured, test with:
```bash
# From your Mac
nslookup srv1079042.hstgr.cloud
# Should return: 147.93.85.115

# Or test in browser
# http://srv1079042.hstgr.cloud should work
```

## Quick Test Commands

Run these to diagnose:
```bash
# From your Mac terminal
nslookup srv1079042.hstgr.cloud
dig srv1079042.hstgr.cloud

# From your VPS
curl -I http://147.93.85.115
```

If `nslookup` or `dig` don't return `147.93.85.115`, DNS is not configured yet.

