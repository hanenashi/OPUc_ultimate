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
            
            // Container for the thumbnails
            const stagingItems = document.createElement('div');
            stagingItems.id = 'opuc-staging-items';
            stagingItems.style.cssText = 'display: flex; gap: 10px; flex-wrap: wrap; width: 100%;';
            
            // Container for Staging Controls (Upload All button)
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
            opucBtn.title = 'Left Click: Add File | Right Click: OPUc Menu';
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
            
            // Listen for OS File Picker selections
            fileInput.addEventListener('change', (e) => {
                if (e.target.files && e.target.files.length > 0) {
                    if (window.OPUcLog) window.OPUcLog.info(`OS Picker caught ${e.target.files.length} file(s).`);
                    window.OPUcCore.handleIncomingFiles(e.target.files);
                }
                fileInput.value = ''; // Reset input so the same file can be picked again if needed
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

            // RIGHT CLICK -> Context Menu (Stub for Phase 6)
            btn.addEventListener('contextmenu', (e) => {
                e.preventDefault(); 
                if (window.OPUcLog) window.OPUcLog.debug("OPUc Button Right-Clicked. Opening Context Menu.");
                alert("OPUc Context Menu will open here! (Gallery, Settings)");
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
