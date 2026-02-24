// modules/04-ui-core.js
(function() {
    'use strict';

    window.OPUcUI = {
        isWorking: false,
        cancelCallback: null,

        inject: function() {
            const dom = window.OPUcConfig.dom;
            if (!dom.form || !dom.textArea || !dom.toolsRow) return;

            const isLoggedIn = window.OPUcConfig.state.isLoggedIn;

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

            const outerSpan = document.createElement('span');
            outerSpan.className = 'yui-button yui-submit-button default';
            outerSpan.style.position = 'relative'; 

            const innerSpan = document.createElement('span');
            innerSpan.className = 'first-child';

            const opucBtn = document.createElement('button');
            opucBtn.id = 'opuc-main-btn';
            opucBtn.className = 'submit'; 
            opucBtn.type = 'button';
            opucBtn.innerHTML = 'OPUc';
            opucBtn.title = 'Left Click: Add File | Right Click: Menu';
            
            opucBtn.style.userSelect = 'none';
            opucBtn.style.webkitUserSelect = 'none';
            opucBtn.style.touchAction = 'manipulation';
            opucBtn.style.transition = 'background-image 0.2s linear'; 
            
            innerSpan.appendChild(opucBtn);
            outerSpan.appendChild(innerSpan);
            dom.toolsRow.appendChild(outerSpan);

            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = 'image/*';
            fileInput.style.display = 'none';
            fileInput.multiple = isLoggedIn; 
            document.body.appendChild(fileInput);

            this.buildContextMenu(outerSpan, isLoggedIn);
            this.attachButtonEvents(opucBtn, outerSpan, fileInput);
            
            fileInput.addEventListener('change', (e) => {
                if (e.target.files && e.target.files.length > 0) window.OPUcCore.handleIncomingFiles(e.target.files);
                fileInput.value = ''; 
            });

            document.addEventListener('click', (e) => {
                const menu = document.getElementById('opuc-context-menu');
                if (menu && menu.style.display === 'block' && e.target !== opucBtn && !outerSpan.contains(e.target)) {
                    menu.style.display = 'none';
                }
            });
        },

        setWorkingState: function(cancelCb) {
            this.isWorking = true;
            this.cancelCallback = cancelCb;
            const btn = document.getElementById('opuc-main-btn');
            if (btn) {
                btn.innerHTML = '✖ Cancel';
                btn.style.setProperty('background-image', 'linear-gradient(90deg, #F44336 0%, #aaa 0%)', 'important');
                btn.style.setProperty('color', '#fff', 'important');
                btn.style.setProperty('text-shadow', '1px 1px 1px rgba(0,0,0,0.5)', 'important');
            }
        },

        updateProgress: function(completed, total) {
            const btn = document.getElementById('opuc-main-btn');
            if (btn && this.isWorking) {
                const pct = Math.round((completed / total) * 100);
                btn.style.setProperty('background-image', `linear-gradient(90deg, #F44336 ${pct}%, #aaa ${pct}%)`, 'important');
            }
        },

        resetButtonState: function() {
            this.isWorking = false;
            this.cancelCallback = null;
            const btn = document.getElementById('opuc-main-btn');
            if (btn) {
                btn.innerHTML = 'OPUc';
                btn.style.removeProperty('background-image');
                btn.style.removeProperty('color');
                btn.style.removeProperty('text-shadow');
            }
        },

        buildContextMenu: function(wrapperElement, isLoggedIn) {
            const menu = document.createElement('div');
            menu.id = 'opuc-context-menu';
            menu.style.cssText = `
                display: none; position: absolute; top: 110%; left: 0; 
                background: var(--opuc-bg-secondary); border: 1px solid var(--opuc-border); 
                border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); 
                z-index: var(--opuc-z-index-overlay, 2147483647); min-width: 150px; overflow: hidden;
                font-family: system-ui, -apple-system, Segoe UI, sans-serif;
                text-align: left;
            `;

            const createItem = (icon, text, onClick, isDisabled = false) => {
                const item = document.createElement('div');
                item.innerHTML = `${icon} <span style="margin-left: 8px;">${text}</span>`;
                item.style.cssText = `
                    padding: 10px 15px; cursor: pointer; color: var(--opuc-text-main); 
                    font-size: 14px; display: flex; align-items: center; border-bottom: 1px solid rgba(0,0,0,0.05);
                `;
                
                if (isDisabled) {
                    item.style.opacity = '0.4';
                    item.style.cursor = 'not-allowed';
                    item.onclick = (e) => { e.preventDefault(); e.stopPropagation(); };
                } else {
                    item.onmouseover = () => item.style.background = 'rgba(255, 152, 0, 0.2)';
                    item.onmouseout = () => item.style.background = 'transparent';
                    item.onclick = (e) => {
                        e.preventDefault(); e.stopPropagation(); 
                        menu.style.display = 'none';
                        onClick();
                    };
                }
                return item;
            };

            menu.appendChild(createItem('🖼️', 'Gallery', () => { if (window.OPUcGallery) window.OPUcGallery.open(); }, !isLoggedIn));
            menu.appendChild(createItem('⏸️', 'Toggle Staging', () => {
                const current = window.OPUcConfig.settings.stagingEnabled;
                window.OPUcConfig.set('opuc_staging_enabled', !current);
                const toast = document.createElement('div');
                toast.innerText = `Staging ${!current ? 'ON' : 'OFF'}`;
                toast.style.cssText = 'position:fixed; bottom:20px; left:50%; transform:translateX(-50%); background:var(--opuc-accent, #FF9800); color:#000; padding:8px 16px; border-radius:20px; z-index:999999; font-weight:bold; transition:opacity 0.3s; pointer-events:none;';
                document.body.appendChild(toast);
                setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 2000);
            }));
            menu.appendChild(createItem('⚙️', 'Settings', () => { if (window.OPUcSettings) window.OPUcSettings.open(); }));

            wrapperElement.appendChild(menu);
        },

        attachButtonEvents: function(btn, wrapperElement, fileInput) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                if (this.isWorking && this.cancelCallback) {
                    this.cancelCallback();
                    this.resetButtonState();
                    return;
                }
                const menu = document.getElementById('opuc-context-menu');
                if (menu && menu.style.display === 'block') {
                    menu.style.display = 'none';
                    return;
                }
                const action = window.OPUcConfig.settings.primaryAction;
                if (action === 'picker' || action === 'staging') fileInput.click();
            });

            btn.addEventListener('contextmenu', (e) => {
                e.preventDefault(); e.stopPropagation();
                if (this.isWorking) return; 
                if (window.getSelection) window.getSelection().removeAllRanges();
                const menu = document.getElementById('opuc-context-menu');
                if (menu) menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
            });
        }
    };
})();
