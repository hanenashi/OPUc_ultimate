// modules/05-interceptors.js
(function() {
    'use strict';

    // A temporary stub that will eventually live in 06-editor.js or 07-api.js
    window.OPUcCore = window.OPUcCore || {
        handleIncomingFiles: function(files) {
            Array.from(files).forEach(file => {
                if (window.OPUcLog) window.OPUcLog.info(`Processing caught file: ${file.name || 'Pasted Blob'} (${file.type})`);
                // TODO: Check if staging is on. 
                // IF ON -> Draw to canvas thumbnail. 
                // IF OFF -> Send straight to OPU API.
            });
        }
    };

    window.OPUcInterceptors = {
        init: function() {
            const dom = window.OPUcConfig.dom;
            if (!dom.textArea) return;

            if (window.OPUcLog) window.OPUcLog.debug("Arming interceptors on textarea...");

            // --- PASTE INTERCEPTOR (Ctrl+V) ---
            if (window.OPUcConfig.settings.interceptPaste) {
                dom.textArea.addEventListener('paste', (e) => {
                    const clipboard = e.clipboardData || window.clipboardData;
                    if (!clipboard || !clipboard.items) return;

                    const filesToProcess = [];
                    for (let i = 0; i < clipboard.items.length; i++) {
                        const item = clipboard.items[i];
                        if (item.type.indexOf('image') !== -1) {
                            const blob = item.getAsFile();
                            if (blob) {
                                e.preventDefault(); // Stop browser from pasting text/image into textarea natively
                                filesToProcess.push(blob);
                            }
                        }
                    }

                    if (filesToProcess.length > 0) {
                        if (window.OPUcLog) window.OPUcLog.info(`Intercepted ${filesToProcess.length} pasted image(s).`);
                        window.OPUcCore.handleIncomingFiles(filesToProcess);
                    }
                });
            }

            // --- DRAG & DROP INTERCEPTOR ---
            if (window.OPUcConfig.settings.interceptDrop) {
                // Visual feedback when dragging over
                dom.textArea.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    dom.textArea.classList.add('opuc-drag-active');
                });

                // Remove feedback when leaving
                dom.textArea.addEventListener('dragleave', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    dom.textArea.classList.remove('opuc-drag-active');
                });

                // Catch the drop
                dom.textArea.addEventListener('drop', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    dom.textArea.classList.remove('opuc-drag-active');
                    
                    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                        const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
                        if (files.length > 0) {
                            if (window.OPUcLog) window.OPUcLog.info(`Intercepted ${files.length} dropped image(s).`);
                            window.OPUcCore.handleIncomingFiles(files);
                        } else {
                            if (window.OPUcLog) window.OPUcLog.warn("Dropped files were not images.");
                        }
                    }
                });
            }
        }
    };
})();
