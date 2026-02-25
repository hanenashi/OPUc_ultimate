// modules/10-settings.js
(function() {
    'use strict';

    window.OPUcSettings = {
        open: function() {
            let modal = document.getElementById('opuc-settings-modal');
            
            if (!modal) {
                modal = document.createElement('div');
                modal.id = 'opuc-settings-modal';
                modal.style.cssText = `
                    position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
                    background: rgba(0,0,0,0.6); z-index: var(--opuc-z-index-overlay, 2147483647);
                    display: flex; flex-direction: column; align-items: center; justify-content: center;
                    backdrop-filter: blur(5px);
                `;

                const container = document.createElement('div');
                container.className = 'opuc-scalable'; // Applies the CSS transform scaling!
                container.style.cssText = `
                    width: 90%; max-width: 500px; background: var(--opuc-bg-secondary);
                    border-radius: 8px; border: 1px solid var(--opuc-border);
                    display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                    color: var(--opuc-text-main); font-family: var(--opuc-font);
                `;

                const header = document.createElement('div');
                header.style.cssText = 'padding: 15px; background: rgba(0,0,0,0.05); border-bottom: 1px solid var(--opuc-border); display: flex; justify-content: space-between; align-items: center;';
                header.innerHTML = '<b style="font-size: 18px;">⚙️ OPUc Settings</b>';
                
                const closeBtn = document.createElement('button');
                closeBtn.innerHTML = '✖';
                closeBtn.style.cssText = 'background: none; border: none; color: var(--opuc-text-main); font-size: 20px; cursor: pointer;';
                closeBtn.onclick = () => this.close();
                header.appendChild(closeBtn);

                const body = document.createElement('div');
                body.style.cssText = 'padding: 20px; display: flex; flex-direction: column; gap: 15px; overflow-y: auto;';

                const createToggle = (id, label, defaultVal) => {
                    const row = document.createElement('label');
                    row.style.cssText = 'display: flex; justify-content: space-between; align-items: center; cursor: pointer; font-size: 14px;';
                    const isChecked = window.OPUcConfig.get(id, defaultVal);
                    row.innerHTML = `<span>${label}</span> <input type="checkbox" id="${id}" ${isChecked ? 'checked' : ''} style="width:18px; height:18px; accent-color: var(--opuc-accent);">`;
                    return row;
                };

                const createSelect = (id, label, options, defaultVal) => {
                    const row = document.createElement('div');
                    row.style.cssText = 'display: flex; flex-direction: column; gap: 5px; font-size: 14px;';
                    const currentVal = window.OPUcConfig.get(id, defaultVal);
                    let selectHTML = `<select id="${id}" style="padding: 8px; background: var(--opuc-bg-secondary); color: var(--opuc-text-main); border: 1px solid var(--opuc-border); border-radius: 4px; outline: none; font-family: inherit;">`;
                    options.forEach(opt => {
                        selectHTML += `<option value="${opt.value}" ${currentVal === opt.value ? 'selected' : ''}>${opt.text}</option>`;
                    });
                    selectHTML += `</select>`;
                    row.innerHTML = `<span>${label}</span> ${selectHTML}`;
                    return row;
                };

                const createInput = (id, label, defaultVal, helpText = '') => {
                    const row = document.createElement('div');
                    row.style.cssText = 'display: flex; flex-direction: column; gap: 5px; font-size: 14px;';
                    const currentVal = window.OPUcConfig.get(id, defaultVal);
                    row.innerHTML = `<span>${label} ${helpText}</span> 
                                     <input type="text" id="${id}" style="padding: 8px; background: var(--opuc-bg-secondary); color: var(--opuc-text-main); border: 1px solid var(--opuc-border); border-radius: 4px; outline: none; font-family: monospace;">`;
                    row.querySelector('input').value = currentVal;
                    return row;
                };

                // Add Theme and Scale to the top
                body.appendChild(createSelect('opuc_theme', 'UI Theme', [
                    { value: 'classic', text: 'Okoun Classic (Light)' },
                    { value: 'dark', text: 'Night Mode (Dark)' },
                    { value: 'contrast', text: 'High Contrast (Hacker)' },
                    { value: 'retro', text: 'Retro 8-Bit' }
                ], 'classic'));
                body.appendChild(createSelect('opuc_ui_scale', 'Mobile UI Scale', [
                    { value: '0.8', text: '80% (Small)' },
                    { value: '1.0', text: '100% (Normal)' },
                    { value: '1.25', text: '125% (Large)' },
                    { value: '1.5', text: '150% (Extra Large)' }
                ], '1.0'));
                
                body.appendChild(createToggle('opuc_staging_enabled', 'Enable Staging Ribbon', true));
                body.appendChild(createInput('opuc_upload_shortcut', 'Clipboard Upload Shortcut', 'Alt+V', '<small style="color:var(--opuc-text-muted);">(e.g., Ctrl+V or Alt+V)</small>'));
                body.appendChild(createToggle('opuc_intercept_paste_urls', 'Leech URLs on Standard Paste (Ctrl+V)', false));
                body.appendChild(createToggle('opuc_intercept_drop', 'Intercept Drag & Drop', true));
                
                body.appendChild(createSelect('opuc_primary_action', 'Primary Button Click (Left/Tap)', [
                    { value: 'picker', text: 'Open OS File Picker' },
                    { value: 'gallery', text: 'Open OPU Gallery' }
                ], 'picker'));
                body.appendChild(createInput('opuc_format_tag', 'Image Injection Format', '<img src="%url%">', '<small style="color:var(--opuc-text-muted);">(Use <b>%url%</b>)</small>'));

                const footer = document.createElement('div');
                footer.style.cssText = 'padding: 15px; background: rgba(0,0,0,0.05); border-top: 1px solid var(--opuc-border); display: flex; justify-content: flex-end;';
                
                const saveBtn = document.createElement('button');
                saveBtn.innerText = 'Save Settings';
                saveBtn.style.cssText = 'background: var(--opuc-accent); color: #000; font-family: inherit; font-weight: bold; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;';
                saveBtn.onclick = () => this.saveAndClose();

                footer.appendChild(saveBtn);

                container.appendChild(header);
                container.appendChild(body);
                container.appendChild(footer);
                modal.appendChild(container);
                document.body.appendChild(modal);
            }

            modal.style.display = 'flex';
        },

        close: function() {
            const modal = document.getElementById('opuc-settings-modal');
            if (modal) modal.style.display = 'none';
        },

        saveAndClose: function() {
            window.OPUcConfig.set('opuc_theme', document.getElementById('opuc_theme').value);
            window.OPUcConfig.set('opuc_ui_scale', document.getElementById('opuc_ui_scale').value);
            window.OPUcConfig.set('opuc_staging_enabled', document.getElementById('opuc_staging_enabled').checked);
            window.OPUcConfig.set('opuc_upload_shortcut', document.getElementById('opuc_upload_shortcut').value);
            window.OPUcConfig.set('opuc_intercept_paste_urls', document.getElementById('opuc_intercept_paste_urls').checked);
            window.OPUcConfig.set('opuc_intercept_drop', document.getElementById('opuc_intercept_drop').checked);
            window.OPUcConfig.set('opuc_primary_action', document.getElementById('opuc_primary_action').value);
            window.OPUcConfig.set('opuc_format_tag', document.getElementById('opuc_format_tag').value);

            if (window.OPUcUI) window.OPUcUI.toggleStaging(document.getElementById('opuc_staging_enabled').checked);
            
            // Instantly apply the new theme and scale!
            if (window.OPUcTheme) window.OPUcTheme.refresh();

            this.close();
        }
    };
})();
