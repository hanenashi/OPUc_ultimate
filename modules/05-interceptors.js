// modules/05-interceptors.js
(function() {
    'use strict';

    window.OPUcCore = window.OPUcCore || {};
    window.OPUcCore.activeLeechRequests = []; 

    window.OPUcCore.leechUrl = function(url) {
        window.OPUcRequest({
            method: 'GET', url: url, responseType: 'blob',
            onload: function(res) {
                if (res.status === 200 && res.response instanceof Blob) {
                    let ext = 'png';
                    const match = url.match(/\.(png|jpe?g|gif|webp|bmp)/i);
                    if (match) ext = match[1].toLowerCase();
                    const file = new File([res.response], `leeched_${Date.now()}.${ext}`, { type: res.response.type });
                    window.OPUcCore.handleIncomingFiles([file]);
                } else {
                    const t = document.createElement('div');
                    t.innerText = "OPUc: Failed to leech image from URL.";
                    t.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#F44336;color:#fff;padding:8px 16px;border-radius:20px;z-index:999999;font-weight:bold;';
                    document.body.appendChild(t);
                    setTimeout(()=>t.remove(), 4000);
                }
            }
        });
    };

    window.OPUcCore.leechUrls = async function(urlsArray) {
        if (urlsArray.length === 0) return;
        const total = urlsArray.length;
        let completed = 0;
        const downloadedFiles = [];
        let isCancelled = false;

        window.OPUcUI.setWorkingState(() => {
            isCancelled = true;
            window.OPUcCore.activeLeechRequests.forEach(abort => abort());
            window.OPUcCore.activeLeechRequests = [];
        });

        for (const url of urlsArray) {
            if (isCancelled) break;
            try {
                const file = await new Promise((resolve, reject) => {
                    const req = window.OPUcRequest({
                        method: 'GET', url: url, responseType: 'blob',
                        onload: (res) => {
                            if (res.status === 200 && res.response instanceof Blob) {
                                let ext = 'png';
                                const match = url.match(/\.(png|jpe?g|gif|webp|bmp)/i);
                                if (match) ext = match[1].toLowerCase();
                                resolve(new File([res.response], `leeched_${Date.now()}.${ext}`, { type: res.response.type }));
                            } else reject(`HTTP ${res.status}`);
                        },
                        onerror: (err) => reject(err),
                        onabort: () => reject('ABORTED')
                    });
                    if (req && typeof req.abort === 'function') window.OPUcCore.activeLeechRequests.push(req.abort);
                });
                downloadedFiles.push(file);
            } catch (err) {}
            completed++;
            window.OPUcUI.updateProgress(completed, total);
        }

        window.OPUcCore.activeLeechRequests = [];
        if (!isCancelled) window.OPUcUI.resetButtonState();
        if (downloadedFiles.length > 0) window.OPUcCore.handleIncomingFiles(downloadedFiles);
    };

    const extractImageUrls = (textData, htmlData) => {
        const urls = new Set();
        const imgRegex = /(?:https?:\/\/)[^\s<>"']+\.(?:png|jpe?g|gif|webp|bmp)(?:\?[^\s<>"']*)?/gi;

        if (htmlData) {
            const doc = new DOMParser().parseFromString(htmlData, 'text/html');
            doc.querySelectorAll('img').forEach(img => { if (img.src && imgRegex.test(img.src)) urls.add(img.src); });
            doc.querySelectorAll('a').forEach(a => { if (a.href && imgRegex.test(a.href)) urls.add(a.href); });
        }
        if (textData) {
            let match;
            while ((match = imgRegex.exec(textData)) !== null) urls.add(match[0]);
        }
        return Array.from(urls);
    };

    window.OPUcInterceptors = {
        init: function() {
            const dom = window.OPUcConfig.dom;
            if (!dom.textArea) return;

            const shortcutRaw = window.OPUcConfig.settings.uploadShortcut || 'Alt+V';
            const shortcut = shortcutRaw.toLowerCase().replace(/\s/g, '');

            // --- NATIVE PASTE EVENT (Ctrl+V) ---
            dom.textArea.addEventListener('paste', (e) => {
                const clipboard = e.clipboardData || window.clipboardData;
                if (!clipboard) return;

                const filesToProcess = [];

                // 1. W3C Standard (Better for Firefox multi-file)
                if (clipboard.files && clipboard.files.length > 0) {
                    Array.from(clipboard.files).forEach(file => {
                        if (file.type.startsWith('image/')) filesToProcess.push(file);
                    });
                }
                
                // 2. Legacy/Chrome Fallback (If files array is empty)
                if (filesToProcess.length === 0 && clipboard.items) {
                    for (let i = 0; i < clipboard.items.length; i++) {
                        const item = clipboard.items[i];
                        if (item.type.startsWith('image/')) {
                            const blob = item.getAsFile();
                            if (blob) filesToProcess.push(blob);
                        }
                    }
                }

                if (filesToProcess.length > 0) {
                    e.preventDefault(); 
                    window.OPUcCore.handleIncomingFiles(filesToProcess);
                } else if (window.OPUcConfig.settings.interceptPasteUrls) {
                    const text = clipboard.getData('text/plain');
                    const html = clipboard.getData('text/html');
                    const foundUrls = extractImageUrls(text, html);
                    if (foundUrls.length > 0) {
                        e.preventDefault();
                        window.OPUcCore.leechUrls(foundUrls);
                    }
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
                        try {
                            const clipboardItems = await navigator.clipboard.read();
                            const files = [];
                            
                            for (const item of clipboardItems) {
                                if (item.types.length === 0) return;
                                const imageTypes = item.types.filter(type => type.startsWith('image/'));
                                if (imageTypes.length > 0) {
                                    for (const type of imageTypes) {
                                        const blob = await item.getType(type);
                                        files.push(new File([blob], `clipboard_${Date.now()}.${type.split('/')[1]}`, { type }));
                                    }
                                } else {
                                    let textData = '', htmlData = '';
                                    if (item.types.includes('text/plain')) textData = await (await item.getType('text/plain')).text();
                                    if (item.types.includes('text/html')) htmlData = await (await item.getType('text/html')).text();
                                    
                                    const foundUrls = extractImageUrls(textData, htmlData);
                                    if (foundUrls.length > 0) {
                                        window.OPUcCore.leechUrls(foundUrls);
                                        return; 
                                    }
                                }
                            }
                            if (files.length > 0) window.OPUcCore.handleIncomingFiles(files);
                        } catch (err) {}
                    }
                });
            }

            // --- DRAG & DROP INTERCEPTOR ---
            if (window.OPUcConfig.settings.interceptDrop) {
                dom.textArea.addEventListener('dragover', (e) => { e.preventDefault(); e.stopPropagation(); dom.textArea.classList.add('opuc-drag-active'); });
                dom.textArea.addEventListener('dragleave', (e) => { e.preventDefault(); e.stopPropagation(); dom.textArea.classList.remove('opuc-drag-active'); });
                dom.textArea.addEventListener('drop', (e) => {
                    e.preventDefault(); e.stopPropagation(); dom.textArea.classList.remove('opuc-drag-active');
                    if (e.dataTransfer && e.dataTransfer.files) {
                        const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
                        if (files.length > 0) window.OPUcCore.handleIncomingFiles(files);
                    }
                });
            }
        }
    };
})();
