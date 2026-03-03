// modules/10-settings.js
(function() {
    'use strict';

    window.OPUcSettings = {
        open: function() {
            let modal = document.getElementById('opuc-settings-modal');
            if (!modal) {
                modal = document.createElement('div');
                modal.id = 'opuc-settings-modal';
                modal.tabIndex = -1; 
                modal.style.cssText = `position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.6); z-index: 2147483647; display: flex; flex-direction: column; align-items: center; justify-content: center; backdrop-filter: blur(5px); outline: none;`;

                const container = document.createElement('div');
                container.className = 'opuc-scalable'; 
                container.style.cssText = `width: 90%; max-width: 500px; background: var(--opuc-bg-secondary); border-radius: 8px; border: 1px solid var(--opuc-border); display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5); color: var(--opuc-text-main); font-family: var(--opuc-font); max-height: 90vh;`;

                const header = document.createElement('div');
                header.style.cssText = 'padding: 15px; background: rgba(0,0,0,0.05); border-bottom: 1px solid var(--opuc-border); display: flex; justify-content: space-between; align-items: center; flex-shrink: 0;';
                header.innerHTML = '<b style="font-size: 18px;">Settings</b>';
                const closeBtn = document.createElement('button');
                closeBtn.innerHTML = '✖';
                closeBtn.style.cssText = 'background: none; border: none; color: var(--opuc-text-main); font-size: 20px; cursor: pointer;';
                closeBtn.onclick = () => this.close();
                header.appendChild(closeBtn);

                const body = document.createElement('div');
                body.style.cssText = 'padding: 20px; display: flex; flex-direction: column; gap: 15px; overflow-y: auto; flex: 1;';

                const nskalBanner = document.createElement('div');
                nskalBanner.style.cssText = 'display: flex; flex-direction: column; align-items: center; margin-bottom: 10px; padding-bottom: 20px; border-bottom: 1px solid var(--opuc-border);';
                nskalBanner.innerHTML = `
                    <img src="https://raw.githubusercontent.com/hanenashi/OPUc_ultimate/main/NSKAL.png" style="width: 120px; height: 120px; border-radius: 16px; box-shadow: 0 6px 16px rgba(0,0,0,0.5); border: 2px solid var(--opuc-border);">
                    <div style="margin-top: 15px; font-size: 22px; font-weight: bold; color: var(--opuc-text-main); letter-spacing: 1px;">OPUc <span style="color: var(--opuc-accent);">NSKAL</span></div>
                    <div style="font-size: 13px; font-weight: bold; color: var(--opuc-text-muted); margin-top: 4px;">Version 0.3.9</div>
                `;
                body.appendChild(nskalBanner);

                const createHeader = (title) => {
                    const hdr = document.createElement('div');
                    hdr.style.cssText = 'margin-top: 10px; padding-bottom: 5px; border-bottom: 1px solid var(--opuc-border); font-weight: bold; color: var(--opuc-accent); font-size: 15px;';
                    hdr.innerText = title; return hdr;
                };

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
                    let currentVal = window.OPUcConfig.get(id, defaultVal);
                    let selectHTML = `<select id="${id}" style="padding: 8px; background: var(--opuc-bg-secondary); color: var(--opuc-text-main); border: 1px solid var(--opuc-border); border-radius: 4px; outline: none; font-family: inherit;">`;
                    options.forEach(opt => { selectHTML += `<option value="${opt.value}" ${currentVal === opt.value ? 'selected' : ''}>${opt.text}</option>`; });
                    selectHTML += `</select>`;
                    row.innerHTML = `<span>${label}</span> ${selectHTML}`;
                    return row;
                };

                const createInput = (id, label, defaultVal, helpText = '') => {
                    const row = document.createElement('div');
                    row.style.cssText = 'display: flex; flex-direction: column; gap: 5px; font-size: 14px;';
                    const currentVal = window.OPUcConfig.get(id, defaultVal);
                    row.innerHTML = `<span>${label} ${helpText}</span> <input type="text" id="${id}" style="padding: 8px; background: var(--opuc-bg-secondary); color: var(--opuc-text-main); border: 1px solid var(--opuc-border); border-radius: 4px; outline: none; font-family: monospace;">`;
                    row.querySelector('input').value = currentVal;
                    return row;
                };

                body.appendChild(createHeader('🎨 Appearance'));
                body.appendChild(createToggle('opuc_nskal_button', 'Replace Main Button with NSKAL Icon', false)); // NEW
                body.appendChild(createSelect('opuc_theme', 'UI Theme', [{ value: 'classic', text: 'Okoun Classic (Light)' }, { value: 'dark', text: 'Night Mode (Dark)' }, { value: 'contrast', text: 'High Contrast (Hacker)' }, { value: 'retro', text: 'Retro 8-Bit' }], 'classic'));
                body.appendChild(createSelect('opuc_ui_scale', 'Mobile UI Scale', [{ value: '0.8', text: '80% (Small)' }, { value: '1.0', text: '100% (Normal)' }, { value: '1.25', text: '125% (Large)' }, { value: '1.5', text: '150% (Extra Large)' }], '1.0'));
                body.appendChild(createSelect('opuc_gallery_thumb_size', 'Gallery Thumbnail Size', [{ value: '80px', text: 'Small (80px)' }, { value: '100px', text: 'Medium (100px)' }, { value: '150px', text: 'Large (150px)' }, { value: '200px', text: 'X-Large (200px)' }], '100px'));

                body.appendChild(createHeader('⚙️ Behavior'));
                body.appendChild(createSelect('opuc_primary_action', 'Primary Button Click (Left/Tap)', [{ value: 'picker', text: 'Open OS File Picker' }, { value: 'gallery', text: 'Open OPU Gallery' }], 'picker'));
                body.appendChild(createToggle('opuc_staging_enabled', 'Enable Staging Ribbon', true));
                body.appendChild(createToggle('opuc_intercept_drop', 'Intercept Drag & Drop', true));
                body.appendChild(createInput('opuc_upload_shortcut', 'Clipboard Shortcut', 'Alt+V', '<small style="color:var(--opuc-text-muted);">(e.g., Ctrl+V or Alt+V)</small>'));
                body.appendChild(createToggle('opuc_intercept_paste_urls', 'Leech URLs on Standard Paste (Ctrl+V)', false));
                
                body.appendChild(createHeader('📝 Captions & Formatting'));
                body.appendChild(createInput('opuc_auto_resize', 'Global Auto-Resize (Physical pixels)', '100%', '<small style="color:var(--opuc-text-muted);">(e.g. 800x, x600, 800x600, 50%)</small>'));
                body.appendChild(createInput('opuc_image_width', 'Inject HTML width="..." attribute', '', '<small style="color:var(--opuc-text-muted);">(e.g. 500, 100%, leave empty for none)</small>'));
                body.appendChild(createSelect('opuc_format', 'Format (Syntax)', [{ value: 'auto', text: 'Auto-detect from Form' }, { value: 'plain', text: 'Text (Plain)' }, { value: 'html', text: 'HTML' }, { value: 'radeox', text: 'Radeox' }, { value: 'markdown', text: 'Markdown' }], 'auto'));
                body.appendChild(createSelect('opuc_style', 'Style (Tag Type)', [{ value: 'url', text: 'Pure URL' }, { value: 'image', text: 'Image' }, { value: 'link', text: 'Link' }, { value: 'thumb', text: 'Linked Thumbnail' }], 'image'));
                body.appendChild(createSelect('opuc_caption_position', 'Caption Position', [{ value: 'below', text: 'Below Image' }, { value: 'above', text: 'Above Image' }, { value: 'title', text: 'Inside Image (Title/Alt Attribute)' }], 'below'));
                body.appendChild(createSelect('opuc_caption_spacing', 'Caption Spacing', [{ value: 'single', text: 'Single Break' }, { value: 'double', text: 'Double Break' }, { value: 'space', text: 'Inline Space' }, { value: 'none', text: 'None' }], 'double'));
                body.appendChild(createSelect('opuc_between_spacing', 'Spacing BETWEEN uploads', [{ value: 'single', text: 'Single Break' }, { value: 'double', text: 'Double Break' }, { value: 'space', text: 'Inline Space' }, { value: 'none', text: 'None' }], 'double'));

                const footer = document.createElement('div');
                footer.style.cssText = 'padding: 15px; background: rgba(0,0,0,0.05); border-top: 1px solid var(--opuc-border); display: flex; justify-content: flex-end; flex-shrink: 0;';
                const saveBtn = document.createElement('button');
                saveBtn.innerText = 'Save Settings';
                saveBtn.style.cssText = 'background: var(--opuc-accent); color: #000; font-family: inherit; font-weight: bold; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;';
                saveBtn.onclick = () => this.saveAndClose();

                modal.addEventListener('keydown', (e) => {
                    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); this.close(); }
                    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') { e.preventDefault(); e.stopPropagation(); this.saveAndClose(); }
                }, true);

                footer.appendChild(saveBtn);
                container.appendChild(header); container.appendChild(body); container.appendChild(footer);
                modal.appendChild(container); document.body.appendChild(modal);
            }
            modal.style.display = 'flex';
            modal.focus();
        },

        close: function() { const modal = document.getElementById('opuc-settings-modal'); if (modal) modal.style.display = 'none'; },

        saveAndClose: function() {
            window.OPUcConfig.set('opuc_theme', document.getElementById('opuc_theme').value);
            window.OPUcConfig.set('opuc_ui_scale', document.getElementById('opuc_ui_scale').value);
            window.OPUcConfig.set('opuc_gallery_thumb_size', document.getElementById('opuc_gallery_thumb_size').value);
            window.OPUcConfig.set('opuc_staging_enabled', document.getElementById('opuc_staging_enabled').checked);
            window.OPUcConfig.set('opuc_upload_shortcut', document.getElementById('opuc_upload_shortcut').value);
            window.OPUcConfig.set('opuc_intercept_paste_urls', document.getElementById('opuc_intercept_paste_urls').checked);
            window.OPUcConfig.set('opuc_intercept_drop', document.getElementById('opuc_intercept_drop').checked);
            window.OPUcConfig.set('opuc_primary_action', document.getElementById('opuc_primary_action').value);
            
            window.OPUcConfig.set('opuc_nskal_button', document.getElementById('opuc_nskal_button').checked); // NEW
            window.OPUcConfig.set('opuc_auto_resize', document.getElementById('opuc_auto_resize').value);
            window.OPUcConfig.set('opuc_image_width', document.getElementById('opuc_image_width').value); 
            window.OPUcConfig.set('opuc_format', document.getElementById('opuc_format').value);
            window.OPUcConfig.set('opuc_style', document.getElementById('opuc_style').value);
            window.OPUcConfig.set('opuc_caption_position', document.getElementById('opuc_caption_position').value);
            window.OPUcConfig.set('opuc_caption_spacing', document.getElementById('opuc_caption_spacing').value);
            window.OPUcConfig.set('opuc_between_spacing', document.getElementById('opuc_between_spacing').value);

            if (window.OPUcUI && typeof window.OPUcUI.toggleStagingAll === 'function') window.OPUcUI.toggleStagingAll(document.getElementById('opuc_staging_enabled').checked);
            if (window.OPUcTheme) window.OPUcTheme.refresh();
            
            // To apply the NSKAL button change properly without forcing a full script injection lifecycle
            alert('Settings Saved! Please refresh the page if you changed the NSKAL Button setting.');
            this.close();
        }
    };
})();