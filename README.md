<p align="center">
  <img src="https://raw.githubusercontent.com/hanenashi/OPUc_ultimate/main/NSKAL.png" width="150" alt="OPUc NSKAL The Mad Fixer">
</p>

# OPUc Ultimate ⚙️

The ultimate userscript integration that brings the `opu.peklo.biz` image hoster directly into the `okoun.cz` messageboard. Manage, stage, leech URLs, crop, resize, and upload your images without ever leaving the reply box.

## 🚀 Installation

Ensure you have a userscript manager installed (like [Tampermonkey](https://www.tampermonkey.net/), [Violentmonkey](https://violentmonkey.github.io/), or Greasemonkey).

👉 **[Click here to install OPUc Ultimate](https://github.com/hanenashi/OPUc_ultimate/raw/main/OPUc.user.js)** 👈

*Note: The script runs a modular architecture. The loader installed above will automatically fetch the latest modules from this repository.*

## ✨ Features

* **Multi-Instance Engine:** Seamlessly injects tools into the main text box AND any dynamic "Reply" boxes you open on the fly.
* **Smart Interceptors:** Paste (`Ctrl+V`) OS files, use the Context Menu, or Drag & Drop images directly onto any Okoun reply box.
* **Image Processor Studio:** A built-in dark-mode editor powered by Cropper.js. Click the `✂️` icon on any staged image to crop, pan, lock aspect ratios, and manually resize before uploading.
* **Auto-Downscale Engine:** Set a global resize limit (e.g., `800x`, `50%`) and the script will automatically shrink massive mobile photos in your browser before they ever hit the network.
* **Staging Area & Batch Uploads:** A visual ribbon to preview thumbnails, reorder via Drag & Drop, review real-time file sizes, and batch-upload multiple images.
* **Caption & Style Editor:** Click the `✏️` on any staged image to add custom captions, configure HTML `title="..."` attributes, or override injection styles just for that image.
* **Smart Auto-Detect Injection:** Automatically reads Okoun's format dropdown and intelligently converts your images to HTML, Markdown, or Radeox syntax with semantic spacing.
* **OPUc Gallery:** A floating, infinite-scrolling overlay to browse and insert your previously uploaded OPU images.
* **Custom Settings & Themes:** Configure keyboard shortcuts, UI scaling, dark/light themes, and custom injection formats. (Plus, a toggle to replace the main UI button with the Mad Fixer).

## 🗺️ Roadmap & Upcoming Features

**Phase 1: Visual Polish**
- [x] **Mobile UI Scaling:** Global `--opuc-scale` variable and Settings slider for high-res mobile displays.
- [x] **Theme Engine Expansion:** Pre-packaged themes (Okoun Classic, Night Mode, High Contrast, Retro 8-bit).

**Phase 2: Staging Pre-Flight**
- [x] **Unobtrusive Metadata:** Display file size and resolution directly on staging thumbnails.
- [x] **Caption Engine:** Add text around images (e.g., descriptions) via a modal editor before batch uploading.
- [x] **Drag-to-Reorder:** Re-arrange the staging queue visually using HTML5 Drag-and-Drop.

**Phase 3: Injection Arsenal**
- [x] **Format Quick-Select:** Custom UI dropdowns to configure global and per-image injection styles.
- [x] **Advanced Formats:** Pure URL, Standard `<img>`, Clickable `<a href>`, Clickable Thumbnail, Markdown, Radeox, plus `title` and `width` attribute injection.
- [x] **Live Preview:** A custom modal to preview the exact formatted code before uploading.

**Phase 4: Power-User Upgrades**
- [x] **Image Cropping Studio:** Full Cropper.js integration for precise framing and aspect ratio control.
- [x] **Client-Side Downscaling:** Auto-resize oversized mobile photos via HTML5 Canvas to save data and bypass server limits.
- [ ] **EXIF Privacy Stripper:** Client-side removal of GPS/camera data before upload.
- [ ] **Crash Recovery:** Serialize un-uploaded staging queues to IndexedDB to survive accidental tab closures.

## 📂 Project Structure

```text
OPUc_ultimate/
├── OPUc.user.js             # The Master Loader (Installs in userscript manager)
├── modules/
│   ├── 01-logger.js         # Custom console debugger
│   ├── 02-config.js         # State management, DOM selectors, and GM4 Universal Wrapper
│   ├── 03-theme.js          # Engine to natively inject CSS variables and UI styling
│   ├── 04-ui-core.js        # Main native button clone, staging container, and progress UI
│   ├── 05-interceptors.js   # Event listeners for Paste, Drag & Drop, and URL Leeching
│   ├── 06-editor.js         # Canvas thumbnails, queue logic, batch uploads, and modals
│   ├── 07-api.js            # Network layer, syntax auto-detection, and smart injection
│   ├── 08-gallery.js        # Floating OPU gallery overlay with infinite scroll
│   ├── 09-init.js           # Async Bootstrapper
│   ├── 10-settings.js       # User configuration modal and local storage manager
│   └── 11-image-processor.js# Cropper.js studio for client-side resizing and framing
├── NSKAL.png                # The Mad Fixer Logo
├── NSKAL.mp4                # The secret Easter Egg animation
└── README.md
```

## 🛠️ Development & Debugging

OPUc includes a heavy-duty logging engine. To view network requests, interceptor catches, and staging events, open your browser's Developer Tools (F12) and check the Console.

To disable logging in production, change `CURRENT_LOG_LEVEL` in `modules/01-logger.js` to `LOG_LEVELS.OFF`.