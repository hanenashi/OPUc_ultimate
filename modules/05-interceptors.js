// modules/05-interceptors.js
(function() {
    'use strict';

    window.OPUcInterceptors = {
        init: function() {
            const dom = window.OPUcConfig.dom;
            if (!dom.textArea) return;

            if (window.OPUcLog) window.OPUcLog.debug("Arming interceptors on textarea...");

            // --- CLIPBOARD SHORTCUT INTERCEPTOR ---
            const shortcutRaw = window.OPUcConfig.settings.uploadShortcut || 'Alt+V';
            const shortcut = shortcutRaw.toLowerCase().replace(/\s/g, '');

            if (shortcut === 'ctrl+v') {
                // NATIVE PASTE EVENT (Legacy Behavior)
                dom.textArea.addEventListener('paste', (e) => {
                    const clipboard = e.clipboardData || window.clipboardData;
                    if (!clipboard || !clipboard.items) return;

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
                    }
                });
            } else if (shortcut !== '' && shortcut !== 'none') {
                // ASYNC CLIPBOARD API FOR CUSTOM HOTKEYS (e.g., Alt+V)
                const keys = shortcut.split('+');
                const reqCtrl = keys.includes('ctrl');
                const reqAlt = keys.includes('alt');
                const reqShift = keys.includes('shift');
                const reqKey = keys[keys.length - 1];

                dom.textArea.addEventListener('keydown', async (e) => {
                    // Match the custom key combo exactly
                    if (e.ctrlKey === reqCtrl && e.altKey === reqAlt && e.shiftKey === reqShift && e.key.toLowerCase() === reqKey) {
                        e.preventDefault();
                        if (window.OPUcLog) window.OPUcLog.debug(`Custom shortcut ${shortcut} pressed. Reading clipboard...`);
                        
                        try {
                            const clipboardItems = await navigator.clipboard.read();
                            const files = [];
                            
                            for (const item of clipboardItems) {
                                const imageTypes = item.types.filter(type => type.startsWith('image/'));
                                for (const type of imageTypes) {
                                    const blob = await item.getType(type);
                                    // Create a generic filename and convert Blob to File
                                    files.push(new File([blob], `clipboard_${Date.now()}.${type.split('/')[1]}`, { type }));
                                }
                            }
                            
                            if (files.length > 0) {
                                window.OPUcCore.handleIncomingFiles(files);
                            } else {
                                if (window.OPUcLog) window.OPUcLog.warn("No images found in clipboard.");
                            }
                        } catch (err) {
                            if (window.OPUcLog) window.OPUcLog.error("Clipboard API access denied.", err);
                            // Fallback toast alert
                            const t = document.createElement('div');
                            t.innerText = "Browser requires clipboard permission for custom shortcuts.";
                            t.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#F44336;color:#fff;padding:8px 16px;border-radius:20px;z-index:999999;font-weight:bold;';
                            document.body.appendChild(t);
                            setTimeout(()=>t.remove(), 3500);
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
