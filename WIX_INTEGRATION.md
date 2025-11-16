# Wix Integration Guide

## Option 1: Using an iframe (Easiest - No Code Required)

### Steps:
1. **Deploy your chatbot** to a public URL (using ngrok, Render, Railway, etc.)
   - Example: `https://your-chatbot-url.com`

2. **In Wix Editor:**
   - Go to your homepage
   - Click **Add** → **Embed** → **Embed a Widget** → **HTML iframe**
   - Paste this code:

```html
<iframe 
  src="https://your-chatbot-url.com" 
  style="position: fixed; bottom: 20px; right: 20px; width: 400px; height: 600px; border: none; z-index: 9999; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.15);"
  allow="clipboard-read; clipboard-write"
></iframe>
```

3. **Adjust the styling** in the iframe code:
   - `width`: Chat popup width (default: 400px)
   - `height`: Chat popup height (default: 600px)
   - `bottom`/`right`: Position from edges (default: 20px)

---

## Option 2: Using Wix Velo (More Control - Requires Code)

### Steps:

1. **In Wix Editor:**
   - Go to **Dev Mode** (top right)
   - Click **Add** → **Embed** → **Custom Element**
   - Place it where you want the chatbot

2. **Add this HTML code** to the Custom Element:

```html
<div id="ff-chatbot-container"></div>
```

3. **In Velo Code Panel** (click **Code** in the left sidebar), add this to your page code:

```javascript
import wixWindow from 'wix-window';

$w.onReady(function () {
  // Replace with your chatbot URL
  const CHATBOT_URL = 'https://your-chatbot-url.com';
  
  // Create iframe
  const iframe = document.createElement('iframe');
  iframe.src = CHATBOT_URL;
  iframe.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 400px;
    height: 600px;
    border: none;
    z-index: 999999;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    background: white;
  `;
  
  // Append to container
  const container = document.getElementById('ff-chatbot-container');
  if (container) {
    container.appendChild(iframe);
  }
});
```

---

## Option 3: Standalone Widget Script (Best for Production)

This creates a floating button that opens the chat in a popup.

### Steps:

1. **In Wix Editor:**
   - Go to **Settings** → **Custom Code**
   - Click **Add Custom Code** → **Body - end**
   - Paste this code (replace `YOUR_CHATBOT_URL`):

```html
<script>
(function() {
  const CHATBOT_URL = 'https://your-chatbot-url.com';
  
  // Create launcher button
  const launcher = document.createElement('button');
  launcher.innerHTML = '💬';
  launcher.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: #7C3AED;
    color: white;
    border: none;
    font-size: 24px;
    cursor: pointer;
    z-index: 999998;
    box-shadow: 0 4px 12px rgba(124, 58, 237, 0.4);
    transition: transform 0.2s;
  `;
  launcher.onmouseover = () => launcher.style.transform = 'scale(1.1)';
  launcher.onmouseout = () => launcher.style.transform = 'scale(1)';
  
  // Create iframe popup
  const iframe = document.createElement('iframe');
  iframe.src = CHATBOT_URL;
  iframe.style.cssText = `
    position: fixed;
    bottom: 90px;
    right: 20px;
    width: 400px;
    height: 600px;
    border: none;
    z-index: 999999;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    display: none;
    background: white;
  `;
  
  // Toggle popup
  let isOpen = false;
  launcher.onclick = () => {
    isOpen = !isOpen;
    iframe.style.display = isOpen ? 'block' : 'none';
    launcher.innerHTML = isOpen ? '✖' : '💬';
  };
  
  // Append to body
  document.body.appendChild(launcher);
  document.body.appendChild(iframe);
})();
</script>
```

---

## Testing Locally First

Before deploying, test on localhost:

1. **Start the server:**
   ```bash
   cd llm-mvp
   source .venv/bin/activate
   uvicorn server:app --reload --host 0.0.0.0 --port 8000
   ```

2. **Open in browser:**
   - Go to `http://localhost:8000`
   - The chatbot should appear on the right side

3. **For Wix testing:**
   - Use ngrok to get a public URL: `ngrok http 8000`
   - Use that URL in the iframe/script above

---

## Important Notes

- **CORS:** The server already has CORS enabled, so it should work in iframes
- **Mobile:** The chatbot is responsive, but you may want to adjust iframe dimensions on mobile
- **Z-index:** Make sure the chatbot z-index (999999) is higher than other Wix elements
- **Performance:** Option 3 (standalone script) is best for performance as it only loads when clicked

---

## Deployment Options (Free)

1. **Render** (Free tier): https://render.com
2. **Railway** (Free tier): https://railway.app
3. **Fly.io** (Free tier): https://fly.io
4. **Vercel** (with Python runtime): https://vercel.com

After deploying, replace `https://your-chatbot-url.com` in the code above with your actual deployment URL.


