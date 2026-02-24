// modules/04-ui-core.js
(function() {
    'use strict';

    window.OPUcUI = {
        inject: function() {
            const dom = window.OPUcConfig.dom;

            if (!dom.form || !dom.textArea || !dom.toolsRow) {
                if (window.OPUcLog) window.OPUcLog.warn("Okoun post form not found. OPUc UI sleeping.");
                return;
            }

            if (window.OPUcLog) window.OPUcLog.info("Injecting OPUc UI components...");

            // 1. Build & Inject Staging Area
            const stagingArea = document.createElement('div');
            stagingArea.id = 'opuc-staging-area';
            
            const stagingItems = document.createElement('div');
            stagingItems.id = 'opuc-staging-items';
            stagingItems.style.cssText = 'display: flex; gap: 10px; flex-wrap: wrap; width: 100%;';
            
            const stagingControls = document.createElement('div');
            stagingControls.id = 'opuc-staging-controls';
            stagingControls.style.cssText = 'width: 100%; display: flex; justify-content: flex-end; margin-top: 8px; border-top: 1px dashed var(--opuc-border); padding-top: 8px; display: none;';
            
            stagingArea.appendChild(stagingItems);
            stagingArea.appendChild(stagingControls);
            dom.textArea.parentNode.insertBefore(stagingArea, dom.textArea);

            // 2. Build & Inject Main Button
            const opucBtn = document.createElement('button');
            opucBtn.id = 'opuc-main-btn';
            opucBtn.type = 'button';
            opucBtn.innerHTML = '⚙️ OPUc';
            opucBtn.title = 'Left Click: Add File | Right Click: Gallery';
            dom.toolsRow.appendChild(opucBtn);

            // 3. Build Hidden File Input for the OS Picker
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.multiple = true;
            fileInput.accept = 'image/*';
            fileInput.style.display = 'none';
            document.body.appendChild(fileInput);

            // 4. Attach Event Listeners
            this.attachButtonEvents(opucBtn, fileInput);
            
            fileInput.addEventListener('change', (e) => {
                if (e.target.files && e.target.files.length > 0) {
                    if (window.OPUcLog) window.OPUcLog.info(`OS Picker caught ${e.target.files.length} file(s).`);
                    window.OPUcCore.handleIncomingFiles(e.target.files);
                }
                fileInput.value = ''; 
            });
        },

        attachButtonEvents: function(btn, fileInput) {
            // LEFT CLICK -> Trigger OS Picker
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const action = window.OPUcConfig.settings.primaryAction;
                if (action === 'picker' || action === 'staging') {
                    if (window.OPUcLog) window.OPUcLog.debug("OPUc Button Clicked. Opening OS File Picker...");
                    fileInput.click();
                } else {
                    if (window.OPUcLog) window.OPUcLog.info(`Action ${action} not fully implemented yet.`);
                }
            });

            // RIGHT CLICK / LONG PRESS -> Open Gallery
            btn.addEventListener('contextmenu', (e) => {
                e.preventDefault(); // Crucial for stopping the native browser menu on mobile long-press
                if (window.OPUcLog) window.OPUcLog.debug("OPUc Button Right-Clicked. Opening Gallery.");
                
                if (window.OPUcGallery) {
                    window.OPUcGallery.open();
                } else {
                    if (window.OPUcLog) window.OPUcLog.error("Gallery module is not loaded!");
                }
            });
        },

        toggleStaging: function(forceState = null) {
            const stagingArea = document.getElementById('opuc-staging-area');
            if (!stagingArea) return;
            
            const isEnabled = forceState !== null ? forceState : window.OPUcConfig.settings.stagingEnabled;
            if (isEnabled) {
                stagingArea.classList.add('active');
            } else {
                stagingArea.classList.remove('active');
            }
        }
    };
})();
