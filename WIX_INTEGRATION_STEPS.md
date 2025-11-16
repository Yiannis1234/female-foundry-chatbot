# Female Foundry Chatbot - Wix Integration Guide

## 🎨 Design Updates Applied
- **Header**: Dark grey/black (#1a1a1a) with white text matching your site
- **Colors**: Red accent dot, black/white theme
- **Size**: 420px wide, max 680px tall (perfect for bottom-right corner)
- **Position**: Fixed bottom-right (24px from edges)
- **Branding**: Matches Female Foundry visual identity

---

## 📋 Step-by-Step Wix Integration

### **Method 1: Floating Chat Button (Recommended - Best UX)**

This creates a floating button that opens the chat when clicked, just like Chatbase.

#### Step 1: Get Your Chatbot URL
- **Current ngrok URL**: `https://573d5ada1e55.ngrok-free.app`
- **Note**: This is temporary. For production, you'll need a permanent URL (see "Production Setup" below)

#### Step 2: Add Custom Code to Wix
1. **Open Wix Editor**
   - Go to your Wix dashboard
   - Click "Edit Site" on your Female Foundry website

2. **Navigate to Settings**
   - Click **Settings** (gear icon) in the left sidebar
   - Click **Custom Code** in the settings menu

3. **Add Code to Body - End**
   - Find the section **"Add code to pages"**
   - Under **"Body - end"**, click **"+ Add Code"**
   - Give it a name: `Female Foundry Chatbot`
   - Select **"All pages"** (or specific pages if you prefer)
   - Paste this code:

```html
<script>
(function() {
  // Replace this URL with your chatbot URL
  const CHATBOT_URL = 'https://573d5ada1e55.ngrok-free.app';
  
  // Create floating button
  const launcher = document.createElement('button');
  launcher.innerHTML = '💬';
  launcher.setAttribute('aria-label', 'Open chat');
  launcher.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: #1a1a1a;
    color: #ffffff;
    border: none;
    font-size: 1.6rem;
    cursor: pointer;
    z-index: 999998;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
    transition: transform 0.2s, box-shadow 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
  `;
  
  // Create iframe for chatbot
  const iframe = document.createElement('iframe');
  iframe.src = CHATBOT_URL;
  iframe.style.cssText = `
    position: fixed;
    bottom: 100px;
    right: 24px;
    width: 420px;
    height: 680px;
    max-height: calc(100vh - 120px);
    border: none;
    z-index: 999999;
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    display: none;
    background: #ffffff;
  `;
  
  // Toggle chat open/closed
  let isOpen = false;
  launcher.addEventListener('click', function() {
    isOpen = !isOpen;
    iframe.style.display = isOpen ? 'block' : 'none';
    launcher.innerHTML = isOpen ? '✖' : '💬';
    launcher.style.transform = isOpen ? 'rotate(90deg)' : 'rotate(0deg)';
  });
  
  // Hover effect
  launcher.addEventListener('mouseenter', function() {
    launcher.style.transform = isOpen ? 'rotate(90deg) scale(1.05)' : 'scale(1.05)';
    launcher.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.4)';
  });
  
  launcher.addEventListener('mouseleave', function() {
    launcher.style.transform = isOpen ? 'rotate(90deg)' : 'scale(1)';
    launcher.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.3)';
  });
  
  // Close on escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && isOpen) {
      isOpen = false;
      iframe.style.display = 'none';
      launcher.innerHTML = '💬';
      launcher.style.transform = 'rotate(0deg)';
    }
  });
  
  // Add to page
  document.body.appendChild(launcher);
  document.body.appendChild(iframe);
  
  // Responsive: adjust on mobile
  function adjustForMobile() {
    if (window.innerWidth <= 768) {
      iframe.style.width = 'calc(100vw - 32px)';
      iframe.style.right = '16px';
      iframe.style.bottom = '100px';
      iframe.style.maxWidth = '420px';
      launcher.style.right = '16px';
      launcher.style.bottom = '16px';
    } else {
      iframe.style.width = '420px';
      iframe.style.right = '24px';
      iframe.style.bottom = '100px';
      launcher.style.right = '24px';
      launcher.style.bottom = '24px';
    }
  }
  
  window.addEventListener('resize', adjustForMobile);
  adjustForMobile();
})();
</script>
```

4. **Save and Publish**
   - Click **"Apply"** or **"Save"**
   - Click **"Publish"** in the top-right corner
   - Visit your live site to test

---

### **Method 2: Direct Iframe Embed (Simpler, but always visible)**

If you prefer the chat to always be visible (no button):

1. **Add HTML Element**
   - In Wix Editor, click **Add** → **Embed** → **HTML iframe**
   - Drag it to the bottom-right area of your page

2. **Configure Iframe**
   - Click the iframe element
   - In the settings panel, click **"Enter Code"**
   - Paste this:

```html
<iframe 
  src="https://573d5ada1e55.ngrok-free.app" 
  style="
    position: fixed;
    bottom: 24px;
    right: 24px;
    width: 420px;
    height: 680px;
    max-height: calc(100vh - 48px);
    border: none;
    z-index: 999999;
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    background: #ffffff;
  "
  allow="clipboard-read; clipboard-write"
></iframe>
```

3. **Publish** your site

---

## 🔧 Production Setup (After Testing)

### Option A: Keep Using ngrok (Free, but URL changes)
- Keep ngrok running on your computer
- Update the URL in Wix whenever it changes
- **Not recommended for production**

### Option B: Deploy to Free Hosting (Recommended)
1. **Render.com** (Free tier):
   - Sign up at render.com
   - Connect your GitHub repo
   - Create a new "Web Service"
   - Set build command: `pip install -r requirements.txt`
   - Set start command: `uvicorn server:app --host 0.0.0.0 --port $PORT`
   - Get your permanent URL (e.g., `https://female-foundry-chatbot.onrender.com`)

2. **Railway.app** (Free tier):
   - Similar process to Render
   - Automatic deployments from GitHub

3. **Fly.io** (Free tier):
   - Deploy with `flyctl launch`
   - Get a permanent URL

### Option C: Wix Velo (Native Wix Hosting)
See `WIX_INTEGRATION.md` for detailed Velo setup instructions.

---

## ✅ Testing Checklist

After integration, test:
- [ ] Chat button appears in bottom-right corner
- [ ] Clicking button opens/closes chat
- [ ] Chat loads and displays correctly
- [ ] Can type and send messages
- [ ] Bot responds with answers
- [ ] Footer links (Website • Programs • Contact) work
- [ ] Works on mobile devices
- [ ] Chat doesn't interfere with site navigation

---

## 🎨 Customization

### Change Button Position
In the code, modify:
```javascript
bottom: 24px;  // Distance from bottom
right: 24px;   // Distance from right
```

### Change Chat Size
Modify:
```javascript
width: 420px;   // Chat width
height: 680px;  // Chat height
```

### Change Button Icon
Replace `💬` with:
- `✉️` (envelope)
- `💬` (chat bubble)
- `📩` (message)
- Or any emoji/text you prefer

---

## 🐛 Troubleshooting

**Chat doesn't appear:**
- Check browser console for errors (F12)
- Verify the chatbot URL is correct
- Make sure you published the site after adding code

**Chat appears but doesn't load:**
- Check if ngrok is still running
- Verify the URL is accessible in a new browser tab
- Check if your firewall is blocking the connection

**Chat overlaps with other elements:**
- Adjust `z-index` values (higher = on top)
- Change `bottom` and `right` positions

**Mobile issues:**
- The code includes responsive adjustments
- Test on actual mobile device, not just browser resize

---

## 📞 Support

If you encounter issues:
1. Check browser console (F12 → Console tab)
2. Verify chatbot URL is accessible
3. Ensure Wix site is published
4. Test in incognito/private browsing mode

---

## 🚀 Next Steps

1. Test the integration on your Wix site
2. Get feedback from users
3. Deploy to permanent hosting (Render/Railway/Fly.io)
4. Update the URL in Wix custom code
5. Monitor chatbot usage and responses

