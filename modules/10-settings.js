// modules/10-settings.js
(function() {
    'use strict';

    window.OPUcSettings = {
        open: function() {
            if (window.OPUcLog) window.OPUcLog.info("Opening Settings Overlay...");
            
            let modal = document.getElementById('opuc-settings-modal');
            
            if (!modal) {
                modal = document.createElement('div');
                modal.id = 'opuc-settings-modal';
                modal.style.cssText = `
                    position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
                    background: rgba(0,0,0,0.85); z-index: var(--opuc-z-index-overlay, 2147483647);
                    display: flex; flex-direction: column; align-items: center; justify-content: center;
                    backdrop-filter: blur(5px);
                `;

                const container = document.createElement('div');
                container.style.cssText = `
                    width: 90%; max-width: 500px; background: var(--opuc-bg-primary, #2b2b2b);
                    border-radius: 8px; border: 1px solid var(--opuc-accent, #FF9800);
                    display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                    color: var(--opuc-text-main, #fff);
                `;

                // Header
                const header = document.createElement('div');
                header.style.cssText = 'padding: 15px; background: rgba(0,0,0,0.2); border-bottom: 1px solid rgba(255,255,255,0.1); display: flex; justify-content: space-between; align-items: center;';
                header.innerHTML = '<b style="font-size: 18px;">⚙️ OPUc Settings</b>';
                
                const closeBtn = document.createElement('button');
                closeBtn.innerHTML = '✖';
                closeBtn.style.cssText = 'background: none; border: none; color: #fff; font-size: 20px; cursor: pointer;';
                closeBtn.onclick = () => this.close();
                header.appendChild(closeBtn);

                // Body (Form)
                const body = document.createElement('div');
                body.style.cssText = 'padding: 20px; display: flex; flex-direction: column; gap: 15px; overflow-y: auto;';

                const createToggle = (id, label, defaultVal) => {
                    const row = document.createElement('label');
                    row.style.cssText = 'display: flex; justify-content: space-between; align-items: center; cursor: pointer; font-size: 14px;';
                    const isChecked = window.OPUcConfig.get(id, defaultVal);
                    row.innerHTML = `<span>${label}</span> <input type="checkbox" id="${id}" ${isChecked ? 'checked' : ''} style="width:18px; height:18px; accent-color: var(--opuc-accent, #FF9800);">`;
                    return row;
                };

                const createSelect = (id, label, options, defaultVal) => {
                    const row = document.createElement('div');
                    row.style.cssText = 'display: flex; flex-direction: column; gap: 5px; font-size: 14px;';
                    const currentVal = window.OPUcConfig.get(id, defaultVal);
                    let selectHTML = `<select id="${id}" style="padding: 8px; background: rgba(0,0,0,0.2); color: #fff; border: 1px solid rgba(255,255,255,0.2); border-radius: 4px; outline: none;">`;
                    options.forEach(opt => {
                        selectHTML += `<option value="${opt.value}" ${currentVal === opt.value ? 'selected' : ''}>${opt.text}</option>`;
                    });
                    selectHTML += `</select>`;
                    row.innerHTML = `<span>${label}</span> ${selectHTML}`;
                    return row;
                };

                const createInput = (id, label, defaultVal) => {
                    const row = document.createElement('div');
                    row.style.cssText = 'display: flex; flex-direction: column; gap: 5px; font-size: 14px;';
                    const currentVal = window.OPUcConfig.get(id, defaultVal);
                    row.innerHTML = `<span>${label} <small style="color:#aaa;">(Use <b>%url%</b> as placeholder)</small></span> 
                                     <input type="text" id="${id}" value="${currentVal}" style="padding: 8px; background: rgba(0,0,0,0.2); color: #fff; border: 1px solid rgba(255,255,255,0.2); border-radius: 4px; outline: none; font-family: monospace;">`;
                    return row;
                };

                body.appendChild(createToggle('opuc_staging_enabled', 'Enable Staging Ribbon', true));
                body.appendChild(createToggle('opuc_intercept_paste', 'Intercept Paste (Ctrl+V)', true));
                body.appendChild(createToggle('opuc_intercept_drop', 'Intercept Drag & Drop', true));
                
                body.appendChild(createSelect('opuc_primary_action', 'Primary Button Click (Left/Tap)', [
                    { value: 'picker', text: 'Open OS File Picker' },
                    { value: 'gallery', text: 'Open OPU Gallery' }
                ], 'picker'));

                body.appendChild(createInput('opuc_format_tag', 'Image Injection Format', '<img src="%url%">'));

                // Footer Actions
                const footer = document.createElement('div');
                footer.style.cssText = 'padding: 15px; background: rgba(0,0,0,0.2); border-top: 1px solid rgba(255,255,255,0.1); display: flex; justify-content: flex-end;';
                
                const saveBtn = document.createElement('button');
                saveBtn.innerText = 'Save Settings';
                saveBtn.style.cssText = 'background: var(--opuc-accent, #FF9800); color: #000; font-weight: bold; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;';
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
            // Read and save all inputs
            window.OPUcConfig.set('opuc_staging_enabled', document.getElementById('opuc_staging_enabled').checked);
            window.OPUcConfig.set('opuc_intercept_paste', document.getElementById('opuc_intercept_paste').checked);
            window.OPUcConfig.set('opuc_intercept_drop', document.getElementById('opuc_intercept_drop').checked);
            window.OPUcConfig.set('opuc_primary_action', document.getElementById('opuc_primary_action').value);
            window.OPUcConfig.set('opuc_format_tag', document.getElementById('opuc_format_tag').value);

            if (window.OPUcLog) window.OPUcLog.info("Settings saved successfully.");
            
            // Instantly apply visual staging toggle if needed
            if (window.OPUcUI) window.OPUcUI.toggleStaging(document.getElementById('opuc_staging_enabled').checked);

            this.close();
        }
    };
})();
