// modules/04-ui-core.js
(function() {
    'use strict';

    window.OPUcUI = {
        inject: function() {
            const dom = window.OPUcConfig.dom;
            if (!dom.form || !dom.textArea || !dom.toolsRow) return;

            const isLoggedIn = window.OPUcConfig.state.isLoggedIn;

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
            
            // ANON MODE STYLING
            if (isLoggedIn) {
                opucBtn.innerHTML = '⚙️ OPUc';
                opucBtn.title = 'Left Click: Add File | Right Click: Menu';
            } else {
                opucBtn.innerHTML = '⚠️ OPUc (Anon)';
                opucBtn.title = 'Anon Mode: Limit 1 File | Right Click: Menu';
                opucBtn.style.backgroundColor = '#8B0000'; // Dark Red Warning
                opucBtn.style.color = '#fff';
            }
            
            opucBtn.style.position = 'relative'; 
            opucBtn.style.userSelect = 'none';
            opucBtn.style.webkitUserSelect = 'none';
            opucBtn.style.touchAction = 'manipulation';
            
            dom.toolsRow.appendChild(opucBtn);

            // 3. Build Hidden File Input
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = 'image/*';
            fileInput.style.display = 'none';
            
            // ANON MODE RESTRICTION: Disable OS multi-select if logged out
            fileInput.multiple = isLoggedIn; 
            
            document.body.appendChild(fileInput);

            // 4. Build Context Menu
            this.buildContextMenu(opucBtn, isLoggedIn);

            // 5. Attach Event Listeners
            this.attachButtonEvents(opucBtn, fileInput);
            
            fileInput.addEventListener('change', (e) => {
                if (e.target.files && e.target.files.length > 0) window.OPUcCore.handleIncomingFiles(e.target.files);
                fileInput.value = ''; 
            });

            document.addEventListener('click', (e) => {
                const menu = document.getElementById('opuc-context-menu');
                if (menu && menu.style.display === 'block' && e.target !== opucBtn && !opucBtn.contains(e.target)) {
                    menu.style.display = 'none';
                }
            });
        },

        buildContextMenu: function(parentBtn, isLoggedIn) {
            const menu = document.createElement('div');
            menu.id = 'opuc-context-menu';
            menu.style.cssText = `
                display: none; position: absolute; top: 110%; left: 0; 
                background: var(--opuc-bg-primary, #2b2b2b); border: 1px solid var(--opuc-accent, #FF9800); 
                border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.5); 
                z-index: var(--opuc-z-index-overlay, 2147483647); min-width: 150px; overflow: hidden;
            `;

            const createItem = (icon, text, onClick, isDisabled = false) => {
                const item = document.createElement('div');
                item.innerHTML = `${icon} <span style="margin-left: 8px;">${text}</span>`;
                item.style.cssText = `
                    padding: 10px 15px; cursor: pointer; color: var(--opuc-text-main, #fff); 
                    font-size: 14px; display: flex; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.05);
                `;
                
                if (isDisabled) {
                    item.style.opacity = '0.4';
                    item.style.cursor = 'not-allowed';
                    item.onclick = (e) => { e.preventDefault(); e.stopPropagation(); };
                } else {
                    item.onmouseover = () => item.style.background = 'rgba(255, 152, 0, 0.2)';
                    item.onmouseout = () => item.style.background = 'transparent';
                    item.onclick = (e) => {
                        e.preventDefault();
                        e.stopPropagation(); 
                        menu.style.display = 'none';
                        onClick();
                    };
                }
                return item;
            };

            // ANON MODE RESTRICTION: Disable Gallery access
            menu.appendChild(createItem('🖼️', 'Gallery', () => {
                if (window.OPUcGallery) window.OPUcGallery.open();
            }, !isLoggedIn));

            menu.appendChild(createItem('⏸️', 'Toggle Staging', () => {
                const current = window.OPUcConfig.settings.stagingEnabled;
                window.OPUcConfig.set('opuc_staging_enabled', !current);
                
                const toast = document.createElement('div');
                toast.innerText = `Staging ${!current ? 'ON' : 'OFF'}`;
                toast.style.cssText = 'position:fixed; bottom:20px; left:50%; transform:translateX(-50%); background:var(--opuc-accent, #FF9800); color:#000; padding:8px 16px; border-radius:20px; z-index:999999; font-weight:bold; transition:opacity 0.3s; pointer-events:none;';
                document.body.appendChild(toast);
                setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 2000);
            }));

            menu.appendChild(createItem('⚙️', 'Settings', () => {
                if (window.OPUcSettings) window.OPUcSettings.open();
            }));

            parentBtn.appendChild(menu);
        },

        attachButtonEvents: function(btn, fileInput) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const menu = document.getElementById('opuc-context-menu');
                if (menu && menu.style.display === 'block') {
                    menu.style.display = 'none';
                    return;
                }
                const action = window.OPUcConfig.settings.primaryAction;
                if (action === 'picker' || action === 'staging') fileInput.click();
            });

            btn.addEventListener('contextmenu', (e) => {
                e.preventDefault(); 
                e.stopPropagation();
                if (window.getSelection) window.getSelection().removeAllRanges();
                
                const menu = document.getElementById('opuc-context-menu');
                if (menu) menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
            });
        },

        toggleStaging: function(forceState = null) {
            const stagingArea = document.getElementById('opuc-staging-area');
            if (!stagingArea) return;
            const isEnabled = forceState !== null ? forceState : window.OPUcConfig.settings.stagingEnabled;
            if (isEnabled) stagingArea.classList.add('active');
            else stagingArea.classList.remove('active');
        }
    };
})();
