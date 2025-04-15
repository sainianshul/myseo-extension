# 🧠 Website Platform & SEO Analyzer - Chrome Extension

A powerful Chrome Extension that detects which platform a website is built with (e.g., WordPress, Shopify, Joomla, Wix, etc.) and identifies the main programming language used. It also extracts key SEO data like meta title, description, canonical tags, headings, and tracking scripts.

---

## 🚀 Features

- 🔍 Detects website platform (WordPress, Joomla, Shopify, Wix, etc.)
- 💻 Identifies the main coding language (HTML, PHP, ASP.NET, Node.js, etc.)
- 📈 Extracts essential SEO data:
  - Meta Title & Description
  - Canonical URL
  - Robots Meta Tag
  - Word Count
  - Last Modified Date
  - H1, H2, H3 Headings
  - GTM / GA4 / Microsoft Clarity Scripts
- 🔄 Auto-updates version info from GitHub
- 📊 Beautiful popup UI with tabbed interface

---

## 📸 Preview

> _Add screenshot of the extension popup here_

---

## 🧩 How to Install (Developer Mode)

1. Clone or download this repository.
2. Open Chrome and go to: `chrome://extensions/`
3. Enable **Developer mode** (top right).
4. Click **Load unpacked** and select the folder of this extension.
5. You're ready to use it! Click the extension icon to analyze any website.

---

## 🛠️ Technologies Used

- JavaScript (Vanilla)
- Chrome Extension APIs (`scripting`, `tabs`, `runtime`)
- HTML / CSS

---

## 🔍 How Platform Detection Works

The extension checks:

- `meta[name="generator"]` tag
- HTML content for platform-specific footprints
- Script and asset URLs (e.g., `wp-content`, `cdn.shopify`, `wixsite`, etc.)

Example platforms detected:
