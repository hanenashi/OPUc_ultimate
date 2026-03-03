// modules/04-ui-core.js
(function() {
    'use strict';

    window.OPUcUI = {
        isWorking: false,
        cancelCallback: null,

        inject: function() {
            const injectAll = () => {
                const textAreas = document.querySelectorAll('textarea[name="body"]');
                textAreas.forEach(ta => {
                    if (!ta.dataset.opucInjected) {
                        const formContainer = ta.closest('form') || ta.closest('.post.content');
                        if (formContainer) this.buildUIForForm(formContainer, ta);
                    }
                });
            };

            injectAll();
            const observer = new MutationObserver(() => injectAll());
            observer.observe(document.body, { childList: true, subtree: true });

            document.addEventListener('click', (e) => {
                if (!e.target.closest('.opuc-main-btn') && !e.target.closest('.opuc-context-menu')) {
                    document.querySelectorAll('.opuc-context-menu').forEach(m => m.style.display = 'none');
                }
            });

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    document.querySelectorAll('.opuc-context-menu').forEach(m => m.style.display = 'none');
                    if (window.OPUcGallery && typeof window.OPUcGallery.close === 'function') window.OPUcGallery.close();
                }
            }, true);
        },

        buildUIForForm: function(container, textArea) {
            textArea.dataset.opucInjected = 'true';
            const toolsRow = container.querySelector('.tools');
            if (!toolsRow) return;

            const isLoggedIn = window.OPUcConfig.state.isLoggedIn;

            const stagingArea = document.createElement('div');
            stagingArea.className = 'opuc-staging-area'; 
            
            const stagingItems = document.createElement('div');
            stagingItems.className = 'opuc-staging-items';
            stagingItems.style.cssText = 'display: flex; gap: 10px; flex-wrap: wrap; width: 100%;';
            
            const stagingControls = document.createElement('div');
            stagingControls.className = 'opuc-staging-controls';
            stagingControls.style.cssText = 'width: 100%; display: flex; justify-content: flex-end; margin-top: 8px; padding-top: 8px; display: none;';
            
            stagingArea.appendChild(stagingItems);
            stagingArea.appendChild(stagingControls);
            textArea.parentNode.insertBefore(stagingArea, textArea);

            const outerSpan = document.createElement('span');
            outerSpan.className = 'yui-button default'; 
            outerSpan.style.position = 'relative'; 

            const innerSpan = document.createElement('span');
            innerSpan.className = 'first-child';

            const opucBtn = document.createElement('button');
            opucBtn.className = 'opuc-main-btn'; 
            opucBtn.type = 'button';
            opucBtn.innerHTML = 'OPUc';
            opucBtn.title = 'Left Click: Add File | Right Click: Menu';
            opucBtn.style.cssText = 'user-select: none; touch-action: manipulation; transition: background-image 0.2s linear;'; 
            
            innerSpan.appendChild(opucBtn);
            outerSpan.appendChild(innerSpan);
            toolsRow.appendChild(outerSpan);

            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = 'image/*';
            fileInput.style.cssText = 'position: absolute; width: 1px; height: 1px; left: -9999px; opacity: 0;';
            fileInput.multiple = isLoggedIn; 
            document.body.appendChild(fileInput);

            const menu = this.buildContextMenu(isLoggedIn, textArea);
            outerSpan.appendChild(menu);

            textArea.addEventListener('focus', () => { window.OPUcConfig.state.activeTextArea = textArea; });

            opucBtn.addEventListener('click', (e) => {
                e.preventDefault();
                window.OPUcConfig.state.activeTextArea = textArea; 
                if (this.isWorking && this.cancelCallback) {
                    this.cancelCallback();
                    this.resetButtonState();
                    return;
                }
                if (menu.style.display === 'block') { menu.style.display = 'none'; return; }
                
                const action = window.OPUcConfig.settings.primaryAction;
                if (action === 'picker') fileInput.click();
                else if (action === 'gallery') { if (window.OPUcGallery) window.OPUcGallery.open(); }
            });

            opucBtn.addEventListener('contextmenu', (e) => {
                e.preventDefault(); e.stopPropagation();
                if (this.isWorking) return; 
                document.querySelectorAll('.opuc-context-menu').forEach(m => { if (m !== menu) m.style.display = 'none'; });
                
                // Dynamically sync Custom Toggle UI
                const textEl = menu.querySelector('#opuc-menu-toggle-text');
                const switchEl = menu.querySelector('#opuc-menu-toggle-switch');
                const dotEl = menu.querySelector('#opuc-menu-toggle-dot');
                if (textEl && switchEl && dotEl) {
                    const isEnabled = window.OPUcConfig.settings.stagingEnabled;
                    textEl.innerText = `Staging ${isEnabled ? 'ON' : 'OFF'}`;
                    switchEl.style.background = isEnabled ? 'var(--opuc-accent)' : 'var(--opuc-bg-primary)';
                    dotEl.style.transform = isEnabled ? 'translateX(14px)' : 'translateX(0)';
                }

                // Dynamically sync Inline Resize Input
                const resizeInput = menu.querySelector('#opuc-menu-resize-input');
                if (resizeInput) {
                    resizeInput.value = window.OPUcConfig.settings.autoResize;
                }

                menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
            });

            fileInput.addEventListener('change', (e) => {
                window.OPUcConfig.state.activeTextArea = textArea;
                if (e.target.files && e.target.files.length > 0) window.OPUcCore.handleIncomingFiles(e.target.files);
                fileInput.value = ''; 
            });

            if (window.OPUcConfig.settings.stagingEnabled && window.OPUcEditor && window.OPUcEditor.queue.length > 0) {
                stagingArea.classList.add('active');
                if(window.OPUcEditor.renderAllStagedItems) window.OPUcEditor.renderAllStagedItems();
            }
        },

        buildContextMenu: function(isLoggedIn, textArea) {
            const menu = document.createElement('div');
            menu.className = 'opuc-context-menu opuc-scalable opuc-origin-tr';
            menu.style.cssText = `display: none; position: absolute; top: 110%; right: 0; background: var(--opuc-bg-secondary); border: 1px solid var(--opuc-border); border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); z-index: var(--opuc-z-index-overlay, 2147483647); min-width: 150px; overflow: hidden; text-align: left; font-family: var(--opuc-font);`;

            const createItem = (id, html, onClick, isDisabled = false) => {
                const item = document.createElement('div');
                item.id = id; item.innerHTML = html;
                item.style.cssText = `padding: 10px 15px; cursor: pointer; color: var(--opuc-text-main); font-size: 14px; display: flex; align-items: center; border-bottom: 1px solid rgba(0,0,0,0.05);`;
                if (isDisabled) {
                    item.style.opacity = '0.4'; item.style.cursor = 'not-allowed';
                    item.onclick = (e) => { e.preventDefault(); e.stopPropagation(); };
                } else {
                    item.onmouseover = () => item.style.background = 'rgba(255, 152, 0, 0.2)';
                    item.onmouseout = () => item.style.background = 'transparent';
                    item.onclick = (e) => { e.preventDefault(); e.stopPropagation(); menu.style.display = 'none'; onClick(); };
                }
                return item;
            };

            menu.appendChild(createItem('opuc-menu-paste', '📋 <span style="margin-left: 8px;">Paste (Leech)</span>', () => { 
                if (window.OPUcCore && window.OPUcCore.processClipboardContent) window.OPUcCore.processClipboardContent(textArea);
            }));
            menu.appendChild(createItem('opuc-menu-gallery', '🖼️ <span style="margin-left: 8px;">Gallery</span>', () => { if (window.OPUcGallery) window.OPUcGallery.open(); }, !isLoggedIn));
            
            // FIXED: Inline Text Input for Global Resize
            const resizeRow = document.createElement('div');
            resizeRow.style.cssText = `padding: 10px 15px; color: var(--opuc-text-main); font-size: 14px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(0,0,0,0.05);`;
            resizeRow.innerHTML = `
                <div style="display:flex; align-items:center;">↔️ <span style="margin-left: 8px;">Resize</span></div>
                <input type="text" id="opuc-menu-resize-input" title="Hit Enter to save" value="${window.OPUcConfig.settings.autoResize}" style="width: 50px; padding: 4px; background: var(--opuc-bg-primary); border: 1px solid var(--opuc-border); color: var(--opuc-text-main); border-radius: 4px; font-family: monospace; font-size: 12px; text-align: center; outline: none;">
            `;
            resizeRow.querySelector('input').addEventListener('click', (e) => e.stopPropagation());
            resizeRow.querySelector('input').addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault(); e.stopPropagation();
                    window.OPUcConfig.set('opuc_auto_resize', e.target.value.trim());
                    menu.style.display = 'none';
                    if (window.OPUcEditor) window.OPUcEditor.renderAllStagedItems();
                }
            });
            resizeRow.querySelector('input').addEventListener('change', (e) => {
                window.OPUcConfig.set('opuc_auto_resize', e.target.value.trim());
                if (window.OPUcEditor) window.OPUcEditor.renderAllStagedItems();
            });
            menu.appendChild(resizeRow);

            // FIXED: Custom CSS Switch Toggle for Staging
            const toggleRow = document.createElement('div');
            toggleRow.style.cssText = `padding: 10px 15px; cursor: pointer; color: var(--opuc-text-main); font-size: 14px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(0,0,0,0.05);`;
            
            const isEnabled = window.OPUcConfig.settings.stagingEnabled;
            const toggleBg = isEnabled ? 'var(--opuc-accent)' : 'var(--opuc-bg-primary)';
            const toggleDot = isEnabled ? 'translateX(14px)' : 'translateX(0)';

            toggleRow.innerHTML = `
                <div style="display:flex; align-items:center;"><span id="opuc-menu-toggle-text">Staging ${isEnabled ? 'ON' : 'OFF'}</span></div>
                <div id="opuc-menu-toggle-switch" style="width: 32px; height: 18px; background: ${toggleBg}; border-radius: 10px; position: relative; transition: background 0.2s; border: 1px solid var(--opuc-border); box-sizing: border-box;">
                    <div id="opuc-menu-toggle-dot" style="width: 14px; height: 14px; background: #fff; border-radius: 50%; position: absolute; top: 1px; left: 1px; transition: transform 0.2s; transform: ${toggleDot}; box-shadow: 0 1px 2px rgba(0,0,0,0.3);"></div>
                </div>
            `;
            
            toggleRow.onmouseover = () => toggleRow.style.background = 'rgba(255, 152, 0, 0.2)';
            toggleRow.onmouseout = () => toggleRow.style.background = 'transparent';
            toggleRow.onclick = (e) => {
                e.preventDefault(); e.stopPropagation(); // Don't close the menu
                const current = window.OPUcConfig.settings.stagingEnabled;
                const newVal = !current;
                window.OPUcConfig.set('opuc_staging_enabled', newVal);
                if (window.OPUcUI && typeof window.OPUcUI.toggleStagingAll === 'function') {
                    window.OPUcUI.toggleStagingAll(newVal);
                }
                
                const textEl = toggleRow.querySelector('#opuc-menu-toggle-text');
                const switchEl = toggleRow.querySelector('#opuc-menu-toggle-switch');
                const dotEl = toggleRow.querySelector('#opuc-menu-toggle-dot');
                textEl.innerText = `Staging ${newVal ? 'ON' : 'OFF'}`;
                switchEl.style.background = newVal ? 'var(--opuc-accent)' : 'var(--opuc-bg-primary)';
                dotEl.style.transform = newVal ? 'translateX(14px)' : 'translateX(0)';
            };
            menu.appendChild(toggleRow);

            // FIXED: Standard uniform font style for Settings row
            menu.appendChild(createItem('opuc-menu-settings', '<img src="https://raw.githubusercontent.com/hanenashi/OPUc_ultimate/main/NSKAL.png" style="width: 32px; height: 32px; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.5);"> <span style="margin-left: 10px;">Settings</span>', () => { if (window.OPUcSettings) window.OPUcSettings.open(); }));
            
            return menu;
        },

        setWorkingState: function(cancelCb) {
            this.isWorking = true; this.cancelCallback = cancelCb;
            document.querySelectorAll('.opuc-main-btn').forEach(btn => {
                btn.innerHTML = '✖ Cancel';
                btn.style.setProperty('background-image', 'linear-gradient(90deg, #F44336 0%, #aaa 0%)', 'important');
                btn.style.setProperty('color', '#fff', 'important');
                btn.style.setProperty('text-shadow', '1px 1px 1px rgba(0,0,0,0.5)', 'important');
            });
        },
        updateProgress: function(completed, total) {
            if (this.isWorking) {
                const pct = Math.round((completed / total) * 100);
                document.querySelectorAll('.opuc-main-btn').forEach(btn => {
                    btn.style.setProperty('background-image', `linear-gradient(90deg, #F44336 ${pct}%, #aaa ${pct}%)`, 'important');
                });
            }
        },
        resetButtonState: function() {
            this.isWorking = false; this.cancelCallback = null;
            document.querySelectorAll('.opuc-main-btn').forEach(btn => {
                btn.innerHTML = 'OPUc';
                btn.style.removeProperty('background-image');
                btn.style.removeProperty('color');
                btn.style.removeProperty('text-shadow');
            });
        },
        toggleStagingAll: function(isEnabled) {
            document.querySelectorAll('.opuc-staging-area').forEach(area => {
                if (isEnabled) area.classList.add('active'); else area.classList.remove('active');
            });
        }
    };
})();