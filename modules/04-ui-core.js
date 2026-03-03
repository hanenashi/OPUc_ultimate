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
                
                const toggleBtn = menu.querySelector('#opuc-menu-toggle');
                if (toggleBtn) {
                    const isEnabled = window.OPUcConfig.settings.stagingEnabled;
                    toggleBtn.innerHTML = isEnabled ? '⏸️ <span style="margin-left: 8px;">Disable Staging</span>' : '▶️ <span style="margin-left: 8px;">Enable Staging</span>';
                }

                const resizeBtn = menu.querySelector('#opuc-menu-resize');
                if (resizeBtn) {
                    resizeBtn.innerHTML = `↔️ <span style="margin-left: 8px;">Resize (${window.OPUcConfig.settings.autoResize})</span>`;
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

        showQuickResizeModal: function(currentValue) {
            let modal = document.createElement('div');
            modal.style.cssText = `position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.6); z-index: 2147483650; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(5px);`;
            
            const box = document.createElement('div');
            box.style.cssText = `background: var(--opuc-bg-secondary); padding: 20px; border-radius: 8px; border: 1px solid var(--opuc-border); display: flex; flex-direction: column; gap: 10px; font-family: var(--opuc-font); color: var(--opuc-text-main);`;
            
            box.innerHTML = `<b>Global Resize Override</b><div style="font-size: 12px; color: var(--opuc-text-muted);">Formats: 800x, x600, 800x600, 50%, 100%</div>`;
            
            const input = document.createElement('input');
            input.value = currentValue;
            input.style.cssText = `padding: 8px; background: var(--opuc-bg-primary); border: 1px solid var(--opuc-border); color: var(--opuc-text-main); border-radius: 4px; outline: none; font-family: monospace;`;
            box.appendChild(input);
            
            const btnRow = document.createElement('div');
            btnRow.style.cssText = `display: flex; justify-content: flex-end; gap: 10px; margin-top: 10px;`;
            
            const cancel = document.createElement('button');
            cancel.innerText = 'Cancel';
            cancel.style.cssText = `padding: 6px 12px; border-radius: 4px; border: 1px solid var(--opuc-border); background: transparent; color: var(--opuc-text-main); cursor: pointer;`;
            
            const save = document.createElement('button');
            save.innerText = 'Save';
            save.style.cssText = `padding: 6px 12px; border-radius: 4px; border: none; background: var(--opuc-accent); color: #000; font-weight: bold; cursor: pointer;`;
            
            const cleanup = () => { document.removeEventListener('keydown', keyH, true); modal.remove(); };
            const doSave = () => { 
                window.OPUcConfig.set('opuc_auto_resize', input.value.trim()); 
                cleanup(); 
                if (window.OPUcEditor) window.OPUcEditor.renderAllStagedItems();
            };
            
            cancel.onclick = cleanup; save.onclick = doSave;
            
            const keyH = (e) => {
                if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); cleanup(); }
                if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); doSave(); }
            };
            document.addEventListener('keydown', keyH, true);
            
            btnRow.appendChild(cancel); btnRow.appendChild(save);
            box.appendChild(btnRow); modal.appendChild(box);
            document.body.appendChild(modal);
            input.focus();
            input.select();
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
            
            menu.appendChild(createItem('opuc-menu-resize', '↔️ <span style="margin-left: 8px;">Resize</span>', () => {
                const current = window.OPUcConfig.settings.autoResize;
                this.showQuickResizeModal(current);
            }));

            menu.appendChild(createItem('opuc-menu-toggle', '⏸️ <span style="margin-left: 8px;">Toggle Staging</span>', () => {
                const current = window.OPUcConfig.settings.stagingEnabled;
                window.OPUcConfig.set('opuc_staging_enabled', !current);
                this.toggleStagingAll(!current);
            }));

            // FIXED: Replaced Gear with 32px NSKAL Icon
            menu.appendChild(createItem('opuc-menu-settings', '<img src="https://raw.githubusercontent.com/hanenashi/OPUc_ultimate/main/NSKAL.png" style="width: 32px; height: 32px; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.5);"> <span style="margin-left: 10px; font-weight: bold; color: var(--opuc-accent);">NSKAL Settings</span>', () => { if (window.OPUcSettings) window.OPUcSettings.open(); }));
            
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