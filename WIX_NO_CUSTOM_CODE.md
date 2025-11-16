# Female Foundry Chatbot - Wix Integration (No Custom Code Required)

## ✅ Solution: Use HTML Element (Works on ALL Wix Plans)

Since Custom Code requires a paid plan, use this method instead - it works on **all Wix plans including free**.

---

## 📋 Step-by-Step Instructions

### **Step 1: Add HTML Element**

1. **In Wix Editor:**
   - Click **"Add"** button (top left, or press `+` key)
   - Scroll down to **"Embed"** section
   - Click **"HTML iframe"**
   - The element will appear on your page

### **Step 2: Position the Chatbot**

1. **Drag the iframe element** to the bottom-right corner of your page
2. **Resize it:**
   - Click the iframe element
   - Drag the corners to make it approximately **420px wide × 680px tall**
   - Or use the settings panel to set exact dimensions

### **Step 3: Configure the Iframe**

1. **Click the iframe element** you just added
2. **In the settings panel on the right**, you'll see:
   - "Enter Code" or "HTML Code" field
   - Click it to open the code editor

3. **Paste this code:**

```html
<iframe 
  src="https://573d5ada1e55.ngrok-free.app" 
  style="
    width: 100%;
    height: 100%;
    border: none;
    border-radius: 16px;
    background: #ffffff;
  "
  allow="clipboard-read; clipboard-write"
></iframe>
```

4. **Click "Update"** or "Apply"

### **Step 4: Make it Fixed Position (Optional - Better UX)**

To make it float in the bottom-right corner like a chat widget:

1. **Click the iframe element**
2. **In the settings panel**, look for **"Position"** or **"Pin to Screen"**
3. **Enable "Pin to Screen"** or **"Fixed Position"**
4. **Set position:**
   - Horizontal: Right, 24px from edge
   - Vertical: Bottom, 24px from edge

**OR** if those options aren't available, use this workaround:

1. **Click the iframe element**
2. **In the settings panel**, find **"Custom CSS"** or **"Advanced"**
3. **Add this CSS:**

```css
position: fixed !important;
bottom: 24px !important;
right: 24px !important;
z-index: 999999 !important;
width: 420px !important;
height: 680px !important;
max-height: calc(100vh - 48px) !important;
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2) !important;
border-radius: 16px !important;
```

---

## 🎨 Alternative: Use Embed Element with Button

If you want a floating button that opens the chat (like Chatbase), but can't use Custom Code:

### **Method: Two Elements Approach**

1. **Add a Button:**
   - Click **Add** → **Button**
   - Drag to bottom-right corner
   - Change text to "💬" or "Chat"
   - Style it: Black background (#1a1a1a), white text, circular

2. **Add the Iframe:**
   - Follow Step 1-3 above
   - Position it near the button

3. **Set up Click Action:**
   - Click the button
   - In settings, find **"Click Actions"** or **"Link"**
   - Set it to show/hide the iframe element
   - Or link to open the chatbot in a new window

---

## 🚀 Quick Setup (Simplest Method)

**If you just want it working quickly:**

1. **Add** → **Embed** → **HTML iframe**
2. **Drag to bottom-right**
3. **Resize to 420px × 680px**
4. **Paste this in the code field:**

```html
<iframe 
  src="https://573d5ada1e55.ngrok-free.app" 
  width="420" 
  height="680" 
  style="border: none; border-radius: 16px; box-shadow: 0 8px 32px rgba(0,0,0,0.2);"
  allow="clipboard-read; clipboard-write"
></iframe>
```

5. **Publish** your site

---

## 📱 Mobile Responsive

The chatbot will automatically adjust on mobile. If you want to hide it on mobile:

1. **Click the iframe element**
2. **In settings**, find **"Visibility"** or **"Show on"**
3. **Uncheck "Mobile"** if you only want it on desktop

---

## ✅ Testing

After publishing:
- [ ] Visit your live site
- [ ] Chatbot appears in bottom-right
- [ ] Can interact with it
- [ ] Footer links work
- [ ] Looks good on mobile

---

## 🔧 Troubleshooting

**Iframe doesn't show:**
- Make sure you published the site
- Check if the chatbot URL is accessible
- Try viewing in incognito mode

**Iframe is too small/large:**
- Click the element and resize using the corner handles
- Or adjust width/height in the code

**Can't position it:**
- Use the drag handles to move it
- Or use the alignment tools in the settings panel

---

## 💡 Pro Tip

If you want the chatbot to appear on **all pages**:
1. After adding the iframe, right-click it
2. Select **"Add to All Pages"** or **"Duplicate to All Pages"**
3. This will add it to every page automatically

---

## 🎯 Next Steps

1. Test the chatbot on your live site
2. Get user feedback
3. Consider upgrading Wix plan later for Custom Code features
4. Or deploy to permanent hosting and update the URL

