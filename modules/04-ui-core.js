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
            stagingArea.innerHTML = '<span style="opacity: 0.5; font-size: 12px; width: 100%; text-align: center;">OPUc Staging Area (Drop files here)</span>';
            // Insert it right above the textarea
            dom.textArea.parentNode.insertBefore(stagingArea, dom.textArea);

            // 2. Build & Inject Main Button
            const opucBtn = document.createElement('button');
            opucBtn.id = 'opuc-main-btn';
            opucBtn.type = 'button'; // Crucial: prevents submitting the Okoun form
            opucBtn.innerHTML = '⚙️ OPUc';
            opucBtn.title = 'Left Click: Add File | Right Click: OPUc Menu';
            
            // Append it to the .tools row next to HTML/Radeox dropdown
            dom.toolsRow.appendChild(opucBtn);

            // 3. Attach Button Event Listeners
            this.attachButtonEvents(opucBtn);
        },

        attachButtonEvents: function(btn) {
            // LEFT CLICK -> Primary Action
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const action = window.OPUcConfig.settings.primaryAction;
                if (window.OPUcLog) window.OPUcLog.debug(`OPUc Button Left-Clicked. Executing: ${action}`);
                
                // TODO: Route to actual action (Phase 4)
                if (action === 'picker') {
                    // We will create a hidden <input type="file"> to trigger OS picker
                    if (window.OPUcLog) window.OPUcLog.info("Triggering OS File Picker...");
                } else if (action === 'gallery') {
                    if (window.OPUcLog) window.OPUcLog.info("Opening OPU Gallery Overlay...");
                }
            });

            // RIGHT CLICK -> Context Menu
            btn.addEventListener('contextmenu', (e) => {
                e.preventDefault(); // Stop standard browser menu
                if (window.OPUcLog) window.OPUcLog.debug("OPUc Button Right-Clicked. Opening Context Menu.");
                
                // TODO: Open Custom Floating Menu (Settings/Gallery)
                alert("OPUc Context Menu will open here! (Phase 4)");
            });
        },

        // Helper to toggle staging visibility
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
