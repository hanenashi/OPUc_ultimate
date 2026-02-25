# OPUc Ultimate ⚙️

The ultimate userscript integration that brings the `opu.peklo.biz` image hoster directly into the `okoun.cz` messageboard. Manage, stage, leech URLs, and upload your images without ever leaving the reply box.

## 🚀 Installation

Ensure you have a userscript manager installed (like [Tampermonkey](https://www.tampermonkey.net/), [Violentmonkey](https://violentmonkey.github.io/), or Greasemonkey).

👉 **[Click here to install OPUc Ultimate](https://github.com/hanenashi/OPUc_ultimate/raw/main/OPUc.user.js)** 👈

*Note: The script runs a modular architecture. The loader installed above will automatically fetch the latest modules from this repository.*

## ✨ Features

* **Smart Interceptors:** Paste (`Ctrl+V`) OS files or Drag & Drop images directly onto the Okoun reply box.
* **URL Leeching:** Press `Alt+V` (or enable standard Paste interception in Settings) to automatically extract and download image URLs from your clipboard directly into staging.
* **Staging Area & Batch Uploads:** A visual ribbon to preview thumbnails, review, and batch-upload multiple images with a built-in progress bar and cancel button.
* **OPUc Gallery:** A floating, infinite-scrolling overlay to browse and insert your previously uploaded OPU images.
* **Anon Mode Safety:** Automatically detects if you are logged out of OPU and restricts uploads to single files to respect server rules.
* **Custom Settings:** An in-page settings menu to configure your keyboard shortcuts, default click actions, and custom image injection formats (e.g., HTML vs. Radeox).
* **Universal Compatibility:** Custom API wrappers ensure full compatibility across Chrome, Firefox, Tampermonkey, and Greasemonkey 4.

## 🗺️ Roadmap & Upcoming Features

**Phase 1: Visual Polish**
- [ ] **Mobile UI Scaling:** Global `--opuc-scale` variable and Settings slider for high-res mobile displays.
- [ ] **Theme Engine Expansion:** Pre-packaged themes (Okoun Classic, Night Mode, High Contrast, Retro 8-bit).

**Phase 2: Staging Pre-Flight**
- [ ] **Unobtrusive Metadata:** Display file size and resolution directly on staging thumbnails.
- [ ] **Caption Engine:** Add text around images (e.g., descriptions) before batch uploading.
- [ ] **Drag-to-Reorder:** Re-arrange the staging queue visually using HTML5 Drag-and-Drop.

**Phase 3: Injection Arsenal**
- [ ] **Format Quick-Select:** Dropdown inside the staging ribbon to change formats on the fly.
- [ ] **Advanced Formats:** Pure URL, Standard `<img>`, Clickable `<a href>`, Clickable Thumbnail (OPU auto-thumb extraction), Markdown, and Radeox.

**Phase 4: Power-User Upgrades**
- [ ] **EXIF Privacy Stripper:** Client-side removal of GPS/camera data before upload.
- [ ] **Client-Side Downscaling:** Auto-resize oversized mobile photos to save data and bypass server limits.
- [ ] **Crash Recovery:** Serialize un-uploaded staging queues to IndexedDB to survive accidental tab closures.

## 📂 Project Structure

OPUc_ultimate/
├── OPUc.user.js             # The Master Loader (Installs in userscript manager)
├── modules/
│   ├── 01-logger.js         # Custom console debugger
│   ├── 02-config.js         # State management, DOM selectors, and GM4 Universal Wrapper
│   ├── 03-theme.js          # Engine to natively inject CSS variables and UI styling
│   ├── 04-ui-core.js        # Main native button clone, staging container, and progress UI
│   ├── 05-interceptors.js   # Event listeners for Paste, Drag & Drop, and URL Leeching
│   ├── 06-editor.js         # Canvas thumbnail generation, queue logic, and batch uploads
│   ├── 07-api.js            # Network layer for OPU authentication and uploads
│   ├── 08-gallery.js        # Floating OPU gallery overlay with infinite scroll
│   ├── 09-init.js           # Async Bootstrapper
│   └── 10-settings.js       # User configuration modal and local storage manager
└── README.md

## 🛠️ Development & Debugging

OPUc includes a heavy-duty logging engine. To view network requests, interceptor catches, and staging events, open your browser's Developer Tools (F12) and check the Console.

To disable logging in production, change `CURRENT_LOG_LEVEL` in `modules/01-logger.js` to `LOG_LEVELS.OFF`.
