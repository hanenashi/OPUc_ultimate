# OPUc Ultimate ⚙️

The ultimate userscript integration that brings the `opu.peklo.biz` image hoster directly into the `okoun.cz` messageboard. Manage, stage, and upload your images without ever leaving the reply box.

## 🚀 Installation

Ensure you have a userscript manager installed (like [Tampermonkey](https://www.tampermonkey.net/) or [Violentmonkey](https://violentmonkey.github.io/)).

👉 **[Click here to install OPUc Ultimate](https://github.com/hanenashi/OPUc_ultimate/raw/main/OPUc.user.js)** 👈

*Note: The script runs a modular architecture. The loader installed above will automatically fetch the latest modules from this repository.*

## ✨ Features

* **Smart Interceptors:** Paste (`Ctrl+V`) or Drag & Drop images directly onto the Okoun reply box.
* **Staging Area:** A visual ribbon to preview, reorder, and queue multiple images before uploading.
* **Silent Uploads:** Background `GM_xmlhttpRequest` bypassing CORS to push payloads directly to OPU.
* **Auto-Formatting:** Automatically injects the returned image URLs into your Okoun post at the cursor's position.
* **Modular & Themeable:** Built with clean CSS variables and strictly separated JavaScript modules.

## 📂 Project Structure

```text
OPUc_ultimate/
├── OPUc.user.js             # The Master Loader (Installs in Tampermonkey)
├── css/                     
│   ├── base.css             # Structural layouts and UI elements
│   └── theme-vanilla.css    # CSS Variables for colors and styling
├── modules/
│   ├── 01-logger.js         # Custom console debugger
│   ├── 02-config.js         # State management and DOM selectors
│   ├── 03-theme.js          # Engine to inject external CSS resources
│   ├── 04-ui-core.js        # Main buttons and staging container injection
│   ├── 05-interceptors.js   # Event listeners for paste and drag & drop
│   ├── 06-editor.js         # Canvas thumbnail generation and queue logic
│   ├── 07-api.js            # Network layer for OPU authentication and uploads
│   ├── 08-gallery.js        # [WIP] Floating OPU gallery overlay
│   └── 09-init.js           # Bootstrapper
└── README.md
```

## 🛠️ Development & Debugging

OPUc includes a heavy-duty logging engine. To view network requests, interceptor catches, and staging events, open your browser's Developer Tools (F12) and check the Console.

To disable logging in production, change `CURRENT_LOG_LEVEL` in `modules/01-logger.js` to `LOG_LEVELS.OFF`.
