# Fix Hostname Issue - Restore DNS

## The Problem
You edited the hostname in Hostinger and changed it back, which may have broken the DNS configuration.

## Quick Fix Steps

### 1. Check Current Hostname on VPS
SSH into your VPS and run:
```bash
hostname
hostname -f
cat /etc/hostname
```

### 2. Check Hostname in Hostinger
In Hostinger control panel:
- Go to: VPS → srv1079042 → Settings
- Check what the hostname is set to
- It should be: `srv1079042.hstgr.cloud`

### 3. Set Hostname Correctly on VPS
If the hostname is wrong on the VPS, fix it:
```bash
# Set hostname
sudo hostnamectl set-hostname srv1079042.hstgr.cloud

# Verify
hostname
hostname -f
```

### 4. Update /etc/hosts File
Make sure `/etc/hosts` has the correct entry:
```bash
sudo nano /etc/hosts
```

It should have:
```
127.0.0.1 localhost
127.0.1.1 srv1079042.hstgr.cloud srv1079042
```

Or:
```
127.0.0.1 localhost srv1079042.hstgr.cloud
```

### 5. Restart Network (if needed)
```bash
sudo systemctl restart systemd-networkd
# or
sudo systemctl restart networking
```

### 6. Check DNS Resolution
From your Mac, test:
```bash
nslookup srv1079042.hstgr.cloud
```

### 7. In Hostinger - Set PTR Record
In Hostinger control panel → VPS → Settings:
- Find "Reverse DNS" or "PTR Record" section
- For IPv4 (147.93.85.115), set PTR record to: `srv1079042.hstgr.cloud`
- Click "Set PTR record"

## Most Likely Fix

The issue is probably that:
1. The hostname in Hostinger settings doesn't match `srv1079042.hstgr.cloud`
2. The PTR record (reverse DNS) isn't set
3. The DNS A record isn't configured

**Do this:**
1. In Hostinger: Make sure hostname is exactly `srv1079042.hstgr.cloud`
2. In Hostinger: Set PTR record for IP 147.93.85.115 to `srv1079042.hstgr.cloud`
3. Wait 5-10 minutes for DNS to propagate
4. Test: `nslookup srv1079042.hstgr.cloud` from your Mac

## Quick Test Commands

Run these on your VPS:
```bash
# Check hostname
hostname
hostname -f

# Check /etc/hosts
cat /etc/hosts

# Check if hostname matches
hostname | grep srv1079042.hstgr.cloud
```

If hostname is wrong, fix it:
```bash
sudo hostnamectl set-hostname srv1079042.hstgr.cloud
```



