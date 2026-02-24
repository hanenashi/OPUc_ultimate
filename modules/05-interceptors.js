// modules/05-interceptors.js
(function() {
    'use strict';

    window.OPUcCore = window.OPUcCore || {};
    
    // --- URL LEECHER ---
    window.OPUcCore.leechUrl = function(url) {
        if (window.OPUcLog) window.OPUcLog.info(`Leeching image from URL: ${url}`);
        
        GM_xmlhttpRequest({
            method: 'GET',
            url: url,
            responseType: 'blob',
            onload: function(res) {
                if (res.status === 200 && res.response instanceof Blob) {
                    // Extract extension or fallback to png
                    let ext = 'png';
                    const match = url.match(/\.(png|jpe?g|gif|webp|bmp)/i);
                    if (match) ext = match[1].toLowerCase();
                    
                    const fileName = `leeched_${Date.now()}.${ext}`;
                    const file = new File([res.response], fileName, { type: res.response.type });
                    
                    if (window.OPUcLog) window.OPUcLog.info(`Leech successful! Pushing ${fileName} to queue.`);
                    window.OPUcCore.handleIncomingFiles([file]);
                } else {
                    if (window.OPUcLog) window.OPUcLog.error(`Failed to leech URL. HTTP ${res.status}`);
                    // Only show a subtle toast instead of an annoying alert
                    const t = document.createElement('div');
                    t.innerText = "OPUc: Failed to leech image from URL. Server might be blocking access.";
                    t.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#F44336;color:#fff;padding:8px 16px;border-radius:20px;z-index:999999;font-weight:bold;';
                    document.body.appendChild(t);
                    setTimeout(()=>t.remove(), 4000);
                }
            },
            onerror: function(err) {
                if (window.OPUcLog) window.OPUcLog.error("Network error while leeching URL.", err);
            }
        });
    };

    // --- HELPER: Extract URL from Text or HTML ---
    const extractImageUrl = (textData, htmlData) => {
        // 1. Try to find a raw, clean URL in the text
        if (textData) {
            const cleanText = textData.trim();
            if (/^https?:\/\/.*\.(png|jpe?g|gif|webp|bmp)(\?.*)?$/i.test(cleanText)) {
                return cleanText;
            }
        }
        // 2. Try to parse HTML to find an embedded <img> tag (common when copying from websites)
        if (htmlData) {
            const doc = new DOMParser().parseFromString(htmlData, 'text/html');
            const img = doc.querySelector('img');
            if (img && img.src && /^https?:\/\//i.test(img.src)) {
                return img.src;
            }
        }
        return null;
    };

    window.OPUcInterceptors = {
        init: function() {
            const dom = window.OPUcConfig.dom;
            if (!dom.textArea) return;

            if (window.OPUcLog) window.OPUcLog.debug("Arming interceptors on textarea...");

            const shortcutRaw = window.OPUcConfig.settings.uploadShortcut || 'Alt+V';
            const shortcut = shortcutRaw.toLowerCase().replace(/\s/g, '');

            // --- NATIVE PASTE EVENT (Ctrl+V) ---
            dom.textArea.addEventListener('paste', (e) => {
                const clipboard = e.clipboardData || window.clipboardData;
                if (!clipboard) return;

                const filesToProcess = [];
                for (let i = 0; i < clipboard.items.length; i++) {
                    const item = clipboard.items[i];
                    if (item.type.indexOf('image') !== -1) {
                        const blob = item.getAsFile();
                        if (blob) filesToProcess.push(blob);
                    }
                }

                if (filesToProcess.length > 0) {
                    e.preventDefault(); 
                    if (window.OPUcLog) window.OPUcLog.info(`Intercepted ${filesToProcess.length} pasted image(s).`);
                    window.OPUcCore.handleIncomingFiles(filesToProcess);
                } else {
                    // Check if they pasted an image URL or an HTML image tag
                    const text = clipboard.getData('text/plain');
                    const html = clipboard.getData('text/html');
                    const foundUrl = extractImageUrl(text, html);
                    
                    if (foundUrl) {
                        e.preventDefault(); 
                        window.OPUcCore.leechUrl(foundUrl);
                    }
                    // If no image and no URL, we do NOT e.preventDefault(). 
                    // The browser will natively paste the text exactly as the user intended.
                }
            });

            // --- ASYNC CLIPBOARD API FOR CUSTOM HOTKEYS (e.g., Alt+V) ---
            if (shortcut !== 'ctrl+v' && shortcut !== '' && shortcut !== 'none') {
                const keys = shortcut.split('+');
                const reqCtrl = keys.includes('ctrl');
                const reqAlt = keys.includes('alt');
                const reqShift = keys.includes('shift');
                const reqKey = keys[keys.length - 1];

                dom.textArea.addEventListener('keydown', async (e) => {
                    if (e.ctrlKey === reqCtrl && e.altKey === reqAlt && e.shiftKey === reqShift && e.key.toLowerCase() === reqKey) {
                        e.preventDefault();
                        if (window.OPUcLog) window.OPUcLog.debug(`Custom shortcut ${shortcut} pressed. Reading clipboard...`);
                        
                        try {
                            const clipboardItems = await navigator.clipboard.read();
                            const files = [];
                            
                            for (const item of clipboardItems) {
                                if (window.OPUcLog) window.OPUcLog.debug(`Clipboard item types detected: [${item.types.join(', ')}]`);

                                // If Chrome hid the OS file completely
                                if (item.types.length === 0) {
                                    if (window.OPUcLog) window.OPUcLog.warn("Browser blocked OS File Explorer copy. Prompting user to use Ctrl+V.");
                                    const t = document.createElement('div');
                                    t.innerText = "Browser security blocks OS Files here. Please use Ctrl+V.";
                                    t.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#FF9800;color:#000;padding:8px 16px;border-radius:20px;z-index:999999;font-weight:bold;';
                                    document.body.appendChild(t);
                                    setTimeout(()=>t.remove(), 4000);
                                    return;
                                }

                                const imageTypes = item.types.filter(type => type.startsWith('image/'));
                                
                                // 1. Grab raw images if available (Snipping Tool, Web copies)
                                if (imageTypes.length > 0) {
                                    for (const type of imageTypes) {
                                        const blob = await item.getType(type);
                                        files.push(new File([blob], `clipboard_${Date.now()}.${type.split('/')[1]}`, { type }));
                                    }
                                } else {
                                    // 2. Hunt for URLs inside Text or HTML
                                    let textData = '', htmlData = '';
                                    if (item.types.includes('text/plain')) {
                                        const textBlob = await item.getType('text/plain');
                                        textData = await textBlob.text();
                                    }
                                    if (item.types.includes('text/html')) {
                                        const htmlBlob = await item.getType('text/html');
                                        htmlData = await htmlBlob.text();
                                    }
                                    
                                    const foundUrl = extractImageUrl(textData, htmlData);
                                    if (foundUrl) {
                                        window.OPUcCore.leechUrl(foundUrl);
                                        return; 
                                    }
                                }
                            }
                            
                            if (files.length > 0) {
                                window.OPUcCore.handleIncomingFiles(files);
                            } else {
                                if (window.OPUcLog) window.OPUcLog.warn("No usable images or image URLs found in clipboard.");
                            }
                        } catch (err) {
                            if (window.OPUcLog) window.OPUcLog.error("Clipboard API access denied or failed.", err);
                        }
                    }
                });
            }

            // --- DRAG & DROP INTERCEPTOR ---
            if (window.OPUcConfig.settings.interceptDrop) {
                dom.textArea.addEventListener('dragover', (e) => {
                    e.preventDefault(); e.stopPropagation();
                    dom.textArea.classList.add('opuc-drag-active');
                });
                dom.textArea.addEventListener('dragleave', (e) => {
                    e.preventDefault(); e.stopPropagation();
                    dom.textArea.classList.remove('opuc-drag-active');
                });
                dom.textArea.addEventListener('drop', (e) => {
                    e.preventDefault(); e.stopPropagation();
                    dom.textArea.classList.remove('opuc-drag-active');
                    
                    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                        const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
                        if (files.length > 0) window.OPUcCore.handleIncomingFiles(files);
                    }
                });
            }
        }
    };
})();
