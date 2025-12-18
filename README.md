# MyParchi Pro - PWA with Enhanced Security

A complete Progressive Web App (PWA) for tracking sales, purchases, receipts and payments. Works offline on both Android and iOS.

## 📁 Files Structure

```
myparchi-pwa/
├── index.html          # Main app HTML
├── app.js              # Application logic + security
├── sw.js               # Service Worker for offline
├── manifest.json       # PWA manifest
├── admin-keygen.html   # 🔐 License key generator (KEEP PRIVATE!)
└── icons/
    ├── icon.svg        # Source icon (convert to PNG)
    └── icon-*.png      # App icons (need to generate)
```

## 🚀 Setup Instructions

### 1. Generate App Icons

You need PNG icons in these sizes: 72, 96, 128, 144, 152, 192, 384, 512

**Option A: Online Tool**
1. Go to https://realfavicongenerator.net/
2. Upload the `icons/icon.svg` file
3. Download generated icons
4. Place in `icons/` folder with names like `icon-192.png`

**Option B: Command Line (if you have ImageMagick)**
```bash
for size in 72 96 128 144 152 192 384 512; do
    convert icons/icon.svg -resize ${size}x${size} icons/icon-${size}.png
done
```

### 2. Host the PWA

PWAs require HTTPS. Options:

**Option A: GitHub Pages (Free)**
1. Create GitHub repo
2. Push all files
3. Enable GitHub Pages in settings
4. Your app will be at: `https://yourusername.github.io/repo-name/`

**Option B: Netlify (Free)**
1. Go to netlify.com
2. Drag & drop the folder
3. Get instant HTTPS URL

**Option C: Local Testing**
```bash
# Install serve globally
npm install -g serve

# Run local server
serve -s . -l 3000

# Open http://localhost:3000
```

### 3. Share with Customers

1. Send them your PWA URL
2. They open in Chrome/Safari
3. Click "Add to Home Screen" (or install banner appears)
4. App installs like native app!

## 🔐 License System

### How It Works

1. **Device ID**: Generated from device fingerprint (screen size, browser, hardware)
2. **License Key**: SHA-256 hash of (DeviceID + BusinessName + Secret)
3. **Validation**: App computes expected key and compares

### Generating License Keys (Admin Only)

1. Open `admin-keygen.html` in your browser
2. Customer sends you their Device ID (shown in app)
3. Enter Device ID + Business Name
4. Click Generate
5. Send key to customer via WhatsApp

⚠️ **IMPORTANT**: Keep `admin-keygen.html` private! Don't upload to public server.

### Security Features

- Device fingerprinting (harder to spoof than simple IDs)
- SHA-256 hashing (can't reverse-engineer the key algorithm)
- Business name binding (key only works for specific business)
- Code integrity checks
- Obfuscated security module

## 📱 Installation on Devices

### Android (Chrome)
1. Open PWA URL in Chrome
2. Tap menu (⋮) → "Add to Home screen"
3. Or wait for install banner

### iOS (Safari)
1. Open PWA URL in Safari
2. Tap Share button (□↑)
3. Tap "Add to Home Screen"
4. Name it and tap Add

### Desktop (Chrome/Edge)
1. Open PWA URL
2. Click install icon in address bar
3. Or menu → "Install MyParchi"

## 🔧 Customization

### Change Business Header
The business name is set during license activation and stored locally.

### Change Theme Colors
Edit `tailwind.config` in `index.html`:
```javascript
colors: {
    brand: {
        dark: '#1e3a8a',    // Header color
        primary: '#2563eb', // Buttons
        light: '#dbeafe',   // Accents
        bg: '#f1f5f9',      // Background
        text: '#1e293b',    // Text
    }
}
```

### Change Secret Key (⚠️ Breaks existing licenses!)
In `app.js`, find and change:
```javascript
const _s = 'mYp@rCh1_2024_$ecure_K3y!';
```
**Must also update `admin-keygen.html` to match!**

## 📊 Data Storage

- All data stored in IndexedDB (browser database)
- Persists across sessions
- Survives browser updates
- **Lost if user clears browser data!**

### Backup System
- Click "Backup" to download JSON file
- Click upload icon to restore
- Recommend weekly backups

## 🛡️ Security Limitations

**What it protects against:**
- Casual copying of the app
- Simple DevTools inspection
- Basic tampering

**What it CAN'T protect against:**
- Determined hackers with source code
- Complete code deobfuscation
- Modified app distribution

For stronger protection, consider:
- Server-side license validation
- Wrapping in Capacitor/Cordova APK
- Code obfuscation tools (javascript-obfuscator)

## 📞 Support

For customer support template:

```
🆘 MyParchi Support

Problem: [describe issue]
Device ID: [8-character code]
Business: [name]
Phone: [number]

Steps tried:
1. Cleared cache? Yes/No
2. Reinstalled? Yes/No
```

## 📜 License

Proprietary - All rights reserved.
Do not distribute without authorization.

---
Made with ❤️ for Indian small businesses
