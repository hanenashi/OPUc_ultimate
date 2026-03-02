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
            stagingControls.style.cssText = 'width: 100%; display: flex; justify-content: flex-end; margin-top: 8px; border-top: 1px dashed var(--opuc-border); padding-top: 8px; display: none;';
            
            stagingArea.appendChild(stagingItems);
            stagingArea.appendChild(stagingControls);
            textArea.parentNode.insertBefore(stagingArea, textArea);

            const outerSpan = document.createElement('span');
            outerSpan.className = 'yui-button yui-submit-button default';
            outerSpan.style.position = 'relative'; 

            const innerSpan = document.createElement('span');
            innerSpan.className = 'first-child';

            const opucBtn = document.createElement('button');
            opucBtn.className = 'submit opuc-main-btn'; 
            opucBtn.type = 'button';
            opucBtn.innerHTML = 'OPUc';
            opucBtn.title = 'Left Click: Add File | Right Click: Menu';
            opucBtn.style.cssText = 'user-select: none; touch-action: manipulation; transition: background-image 0.2s linear;'; 
            
            innerSpan.appendChild(opucBtn);
            outerSpan.appendChild(innerSpan);
            toolsRow.appendChild(outerSpan);

            // FIXED: Mobile file picker bug. Replaced display:none with absolute/invisible CSS.
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
                if (window.OPUcConfig.settings.primaryAction === 'picker') fileInput.click();
            });

            opucBtn.addEventListener('contextmenu', (e) => {
                e.preventDefault(); e.stopPropagation();
                if (this.isWorking) return; 
                document.querySelectorAll('.opuc-context-menu').forEach(m => { if (m !== menu) m.style.display = 'none'; });
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
            menu.style.cssText = `
                display: none; position: absolute; top: 110%; right: 0; 
                background: var(--opuc-bg-secondary); border: 1px solid var(--opuc-border); 
                border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); 
                z-index: var(--opuc-z-index-overlay, 2147483647); min-width: 150px; overflow: hidden;
                text-align: left; font-family: var(--opuc-font);
            `;

            const createItem = (icon, text, onClick, isDisabled = false) => {
                const item = document.createElement('div');
                item.innerHTML = `${icon} <span style="margin-left: 8px;">${text}</span>`;
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

            // NEW: Menu-triggered Paste Parser
            menu.appendChild(createItem('📋', 'Paste (Leech)', () => { 
                if (window.OPUcCore && window.OPUcCore.processClipboardContent) {
                    window.OPUcCore.processClipboardContent(textArea);
                }
            }));
            menu.appendChild(createItem('🖼️', 'Gallery', () => { if (window.OPUcGallery) window.OPUcGallery.open(); }, !isLoggedIn));
            menu.appendChild(createItem('⏸️', 'Toggle Staging', () => {
                const current = window.OPUcConfig.settings.stagingEnabled;
                window.OPUcConfig.set('opuc_staging_enabled', !current);
                this.toggleStagingAll(!current);
            }));
            menu.appendChild(createItem('⚙️', 'Settings', () => { if (window.OPUcSettings) window.OPUcSettings.open(); }));
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