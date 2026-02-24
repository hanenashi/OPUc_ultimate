// modules/05-interceptors.js
(function() {
    'use strict';

    // --- URL LEECHER ---
    // If the user pastes a raw URL to an image, download it and convert it to a File object
    window.OPUcCore = window.OPUcCore || {};
    window.OPUcCore.leechUrl = function(url) {
        if (window.OPUcLog) window.OPUcLog.info(`Leeching image from URL: ${url}`);
        
        GM_xmlhttpRequest({
            method: 'GET',
            url: url,
            responseType: 'blob',
            onload: function(res) {
                if (res.status === 200 && res.response instanceof Blob) {
                    const ext = url.split('.').pop().split('?')[0] || 'png';
                    const fileName = `leeched_${Date.now()}.${ext}`;
                    const file = new File([res.response], fileName, { type: res.response.type });
                    
                    if (window.OPUcLog) window.OPUcLog.info(`Leech successful! Pushing ${fileName} to queue.`);
                    window.OPUcCore.handleIncomingFiles([file]);
                } else {
                    if (window.OPUcLog) window.OPUcLog.error(`Failed to leech URL. HTTP ${res.status}`);
                    alert("OPUc: Failed to download the image from the pasted URL.");
                }
            },
            onerror: function(err) {
                if (window.OPUcLog) window.OPUcLog.error("Network error while leeching URL.", err);
            }
        });
    };

    window.OPUcInterceptors = {
        init: function() {
            const dom = window.OPUcConfig.dom;
            if (!dom.textArea) return;

            if (window.OPUcLog) window.OPUcLog.debug("Arming interceptors on textarea...");

            const shortcutRaw = window.OPUcConfig.settings.uploadShortcut || 'Alt+V';
            const shortcut = shortcutRaw.toLowerCase().replace(/\s/g, '');

            // --- NATIVE PASTE EVENT (Ctrl+V) ---
            // Highly reliable for OS Files (File Explorer copies)
            dom.textArea.addEventListener('paste', (e) => {
                const clipboard = e.clipboardData || window.clipboardData;
                if (!clipboard) return;

                const filesToProcess = [];
                for (let i = 0; i < clipboard.items.length; i++) {
                    const item = clipboard.items[i];
                    if (item.type.indexOf('image') !== -1) {
                        const blob = item.getAsFile();
                        if (blob) {
                            e.preventDefault(); 
                            filesToProcess.push(blob);
                        }
                    }
                }

                if (filesToProcess.length > 0) {
                    if (window.OPUcLog) window.OPUcLog.info(`Intercepted ${filesToProcess.length} pasted image(s).`);
                    window.OPUcCore.handleIncomingFiles(filesToProcess);
                } else {
                    // Check if it's a URL to an image
                    const text = clipboard.getData('text');
                    if (text) {
                        const cleanText = text.trim();
                        if (/^https?:\/\/.*\.(png|jpe?g|gif|webp|bmp)(\?.*)?$/i.test(cleanText)) {
                            e.preventDefault(); // Stop Okoun from pasting the raw text
                            window.OPUcCore.leechUrl(cleanText);
                        }
                    }
                }
            });

            // --- ASYNC CLIPBOARD API FOR CUSTOM HOTKEYS (e.g., Alt+V) ---
            // Great for Snipping Tool and Text, but browsers block OS File Explorer copies here
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
                                // Debug log to see exactly what the OS gave the browser
                                if (window.OPUcLog) window.OPUcLog.debug(`Clipboard item types detected: ${item.types.join(', ')}`);

                                const imageTypes = item.types.filter(type => type.startsWith('image/'));
                                
                                if (imageTypes.length > 0) {
                                    for (const type of imageTypes) {
                                        const blob = await item.getType(type);
                                        files.push(new File([blob], `clipboard_${Date.now()}.${type.split('/')[1]}`, { type }));
                                    }
                                } else if (item.types.includes('text/plain')) {
                                    const textBlob = await item.getType('text/plain');
                                    const text = await textBlob.text();
                                    const cleanText = text.trim();

                                    if (/^https?:\/\/.*\.(png|jpe?g|gif|webp|bmp)(\?.*)?$/i.test(cleanText)) {
                                        window.OPUcCore.leechUrl(cleanText);
                                        return; // Break out, leeching handles the rest
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
                    e.preventDefault();
                    e.stopPropagation();
                    dom.textArea.classList.add('opuc-drag-active');
                });

                dom.textArea.addEventListener('dragleave', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    dom.textArea.classList.remove('opuc-drag-active');
                });

                dom.textArea.addEventListener('drop', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    dom.textArea.classList.remove('opuc-drag-active');
                    
                    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                        const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
                        if (files.length > 0) {
                            if (window.OPUcLog) window.OPUcLog.info(`Intercepted ${files.length} dropped image(s).`);
                            window.OPUcCore.handleIncomingFiles(files);
                        }
                    }
                });
            }
        }
    };
})();
