// modules/06-editor.js
(function() {
    'use strict';

    const formatBytes = (bytes) => {
        if (!bytes || bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    window.OPUcEditor = {
        queue: [], 
        isUploading: false, 

        createThumbnail: function(file, callback) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    const MAX_WIDTH = 150; 
                    const MAX_HEIGHT = 150;
                    let width = img.width; let height = img.height;
                    const origWidth = width; const origHeight = height;
                    if (width > height) { if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; } } 
                    else { if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; } }
                    canvas.width = width; canvas.height = height;
                    ctx.drawImage(img, 0, 0, width, height);
                    callback(canvas.toDataURL('image/jpeg', 0.8), origWidth, origHeight);
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        },

        renderAllStagedItems: function() {
            this.queue = this.queue.filter(f => f !== null);
            const allStagingContainers = document.querySelectorAll('.opuc-staging-items');
            allStagingContainers.forEach(container => {
                container.innerHTML = ''; 
                this.queue.forEach((file, index) => {
                    const tile = this.renderStagedItem(file, index);
                    container.appendChild(tile);
                });
            });
            this.refreshControls();
        },

        renderStagedItem: function(file, index) {
            const container = document.createElement('div');
            container.className = 'opuc-stage-tile';
            container.dataset.index = index;
            container.draggable = true; 
            
            container.style.cssText = `
                width: 120px; display: flex; flex-direction: column; 
                border: 1px solid var(--opuc-border); border-radius: 4px; overflow: hidden; 
                background: var(--opuc-bg-secondary); box-shadow: 0 2px 5px rgba(0,0,0,0.2); 
                cursor: grab; user-select: none;
            `;

            container.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', index);
                setTimeout(() => container.style.opacity = '0.4', 0);
            });
            container.addEventListener('dragend', () => {
                container.style.opacity = '1';
                document.querySelectorAll('.opuc-stage-tile').forEach(el => el.classList.remove('opuc-drag-left', 'opuc-drag-right'));
            });
            container.addEventListener('dragover', (e) => {
                e.preventDefault();
                const rect = container.getBoundingClientRect();
                const midPoint = rect.left + rect.width / 2;
                document.querySelectorAll('.opuc-stage-tile').forEach(el => {
                    if (el !== container) el.classList.remove('opuc-drag-left', 'opuc-drag-right');
                });
                if (e.clientX < midPoint) { container.classList.add('opuc-drag-left'); container.classList.remove('opuc-drag-right'); } 
                else { container.classList.add('opuc-drag-right'); container.classList.remove('opuc-drag-left'); }
            });
            container.addEventListener('dragleave', () => container.classList.remove('opuc-drag-left', 'opuc-drag-right'));
            container.addEventListener('drop', (e) => {
                e.preventDefault();
                container.classList.remove('opuc-drag-left', 'opuc-drag-right');
                const draggedIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
                if (!isNaN(draggedIndex) && draggedIndex !== index) {
                    const rect = container.getBoundingClientRect();
                    const insertBefore = e.clientX < (rect.left + rect.width / 2);
                    const itemToMove = this.queue.splice(draggedIndex, 1)[0];
                    let targetIndex = index;
                    if (draggedIndex < index) targetIndex--; 
                    if (!insertBefore) targetIndex++; 
                    this.queue.splice(targetIndex, 0, itemToMove);
                    this.renderAllStagedItems();
                }
            });

            const topHalf = document.createElement('div');
            topHalf.style.cssText = 'position: relative; height: 90px; background: #000;';

            const imgPreview = document.createElement('img');
            imgPreview.style.cssText = 'width: 100%; height: 100%; object-fit: cover; opacity: 0.5; transition: opacity 0.2s; pointer-events: none;';
            topHalf.appendChild(imgPreview);

            const removeBtn = document.createElement('button');
            removeBtn.innerHTML = '✖';
            removeBtn.style.cssText = 'position: absolute; top: 4px; left: 4px; background: rgba(244, 67, 54, 0.9); color: white; border: none; border-radius: 4px; width: 22px; height: 22px; font-size: 11px; cursor: pointer; z-index: 10;';
            removeBtn.onclick = (e) => { e.preventDefault(); this.removeFromQueue(index); };
            topHalf.appendChild(removeBtn);

            // THE EDIT BUBBLE
            const hasCaption = !!file.opucCaption || !!file.opucFormatOverride;
            const editBtn = document.createElement('button');
            editBtn.innerHTML = hasCaption ? '💬' : '✏️';
            editBtn.title = hasCaption ? (file.opucCaption || 'Custom Format Active') : 'Add Caption / Format Override';
            editBtn.style.cssText = `position: absolute; top: 4px; right: 4px; background: ${hasCaption ? 'rgba(76, 175, 80, 0.95)' : 'rgba(255, 152, 0, 0.9)'}; color: ${hasCaption ? '#fff' : '#000'}; border: none; border-radius: 4px; width: 22px; height: 22px; font-size: 11px; cursor: pointer; z-index: 10;`;
            editBtn.onclick = (e) => { e.preventDefault(); this.openCaptionModal(index); };
            topHalf.appendChild(editBtn);

            container.appendChild(topHalf);

            const bottomHalf = document.createElement('div');
            bottomHalf.style.cssText = 'padding: 4px 6px; display: flex; flex-direction: column; gap: 2px; border-top: 1px solid var(--opuc-border);';

            const nameLbl = document.createElement('div');
            nameLbl.style.cssText = 'font-size: 10px; color: var(--opuc-text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: bold;';
            nameLbl.innerText = file.name || 'clipboard_img';
            bottomHalf.appendChild(nameLbl);

            const metaLbl = document.createElement('div');
            metaLbl.style.cssText = 'font-size: 9px; color: var(--opuc-text-muted); display: flex; justify-content: space-between;';
            
            const sizeSpan = document.createElement('span'); sizeSpan.innerText = formatBytes(file.size);
            const resSpan = document.createElement('span'); resSpan.innerText = '...'; 

            metaLbl.appendChild(sizeSpan); metaLbl.appendChild(resSpan);
            bottomHalf.appendChild(metaLbl); container.appendChild(bottomHalf);

            this.createThumbnail(file, (thumbData, w, h) => {
                imgPreview.src = thumbData; imgPreview.style.opacity = '1'; resSpan.innerText = `${w}x${h}`;
            });
            return container;
        },

        // NEW: The Caption & Override Editor Modal
        openCaptionModal: function(index) {
            const file = this.queue[index];
            if (!file) return;

            let modal = document.getElementById('opuc-caption-modal');
            if (modal) modal.remove(); // Rebuild fresh each time

            modal = document.createElement('div');
            modal.id = 'opuc-caption-modal';
            modal.style.cssText = `position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.6); z-index: 2147483648; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(5px);`;

            const container = document.createElement('div');
            container.className = 'opuc-scalable'; 
            container.style.cssText = `width: 90%; max-width: 400px; background: var(--opuc-bg-secondary); border-radius: 8px; border: 1px solid var(--opuc-border); display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.3); color: var(--opuc-text-main); font-family: var(--opuc-font);`;

            const header = document.createElement('div');
            header.style.cssText = 'padding: 12px 15px; background: rgba(0,0,0,0.05); border-bottom: 1px solid var(--opuc-border); display: flex; justify-content: space-between; align-items: center; font-weight: bold;';
            header.innerHTML = `<span>✏️ Edit File</span>`;
            const closeBtn = document.createElement('button');
            closeBtn.innerHTML = '✖';
            closeBtn.style.cssText = 'background: none; border: none; color: var(--opuc-text-main); font-size: 16px; cursor: pointer;';
            closeBtn.onclick = () => modal.remove();
            header.appendChild(closeBtn);

            const body = document.createElement('div');
            body.style.cssText = 'padding: 15px; display: flex; flex-direction: column; gap: 15px;';

            const infoRow = document.createElement('div');
            infoRow.style.cssText = 'display: flex; gap: 15px; align-items: center;';
            
            const imgPreview = document.createElement('img');
            imgPreview.style.cssText = 'width: 60px; height: 60px; object-fit: cover; border-radius: 4px; border: 1px solid var(--opuc-border); background: #000;';
            this.createThumbnail(file, (data) => imgPreview.src = data);
            
            const fileData = document.createElement('div');
            fileData.style.cssText = 'font-size: 12px; color: var(--opuc-text-muted); overflow: hidden; white-space: nowrap; text-overflow: ellipsis;';
            fileData.innerHTML = `<b style="color:var(--opuc-text-main);">${file.name}</b><br>${formatBytes(file.size)}`;
            
            infoRow.appendChild(imgPreview);
            infoRow.appendChild(fileData);
            body.appendChild(infoRow);

            const capLabel = document.createElement('label');
            capLabel.style.cssText = 'font-size: 12px; color: var(--opuc-text-muted);';
            capLabel.innerText = 'Image Caption:';
            const capInput = document.createElement('textarea');
            capInput.rows = 2;
            capInput.value = file.opucCaption || '';
            capInput.placeholder = 'e.g., Dusky Thrush taken at Odori';
            capInput.style.cssText = 'width: 100%; padding: 8px; border-radius: 4px; border: 1px solid var(--opuc-border); background: var(--opuc-bg-primary); color: var(--opuc-text-main); font-family: inherit; resize: vertical; box-sizing: border-box; outline: none; margin-top: 4px;';
            
            const capWrapper = document.createElement('div');
            capWrapper.appendChild(capLabel); capWrapper.appendChild(capInput);
            body.appendChild(capWrapper);

            const fmtLabel = document.createElement('label');
            fmtLabel.style.cssText = 'font-size: 12px; color: var(--opuc-text-muted); display: block; margin-bottom: 4px;';
            fmtLabel.innerText = 'Format Override (Optional):';
            const fmtSelect = document.createElement('select');
            fmtSelect.style.cssText = 'width: 100%; padding: 8px; border-radius: 4px; border: 1px solid var(--opuc-border); background: var(--opuc-bg-primary); color: var(--opuc-text-main); font-family: inherit; outline: none; box-sizing: border-box;';
            
            const options = [
                { val: '', text: '-- Use Global Default --' },
                { val: '<img src="%url%">', text: 'HTML (<img>)' },
                { val: '<a href="%url%">%url%</a>', text: 'HTML (Link)' },
                { val: '[img:%url%]', text: 'Radeox ([img])' },
                { val: '![image](%url%)', text: 'Markdown (![])' }
            ];
            options.forEach(opt => {
                const el = document.createElement('option');
                el.value = opt.val; el.text = opt.text;
                if (file.opucFormatOverride === opt.val) el.selected = true;
                fmtSelect.appendChild(el);
            });
            
            const fmtWrapper = document.createElement('div');
            fmtWrapper.appendChild(fmtLabel); fmtWrapper.appendChild(fmtSelect);
            body.appendChild(fmtWrapper);

            const footer = document.createElement('div');
            footer.style.cssText = 'padding: 12px 15px; background: rgba(0,0,0,0.05); border-top: 1px solid var(--opuc-border); display: flex; justify-content: flex-end; gap: 10px;';
            
            const cancelBtn = document.createElement('button');
            cancelBtn.innerText = 'Cancel';
            cancelBtn.style.cssText = 'padding: 6px 12px; border-radius: 4px; border: 1px solid var(--opuc-border); background: transparent; color: var(--opuc-text-main); cursor: pointer;';
            cancelBtn.onclick = () => modal.remove();

            const saveBtn = document.createElement('button');
            saveBtn.innerText = 'Save';
            saveBtn.style.cssText = 'padding: 6px 16px; border-radius: 4px; border: none; background: var(--opuc-accent); color: #000; font-weight: bold; cursor: pointer;';
            saveBtn.onclick = () => {
                file.opucCaption = capInput.value.trim();
                file.opucFormatOverride = fmtSelect.value;
                modal.remove();
                this.renderAllStagedItems(); 
            };

            footer.appendChild(cancelBtn); footer.appendChild(saveBtn);
            container.appendChild(header); container.appendChild(body); container.appendChild(footer);
            modal.appendChild(container); document.body.appendChild(modal);
        },

        removeFromQueue: function(index) {
            this.queue[index] = null; 
            this.renderAllStagedItems();
        },

        refreshControls: function() {
            const activeItems = this.queue.filter(item => item !== null).length;
            const allControls = document.querySelectorAll('.opuc-staging-controls');
            
            allControls.forEach(controls => {
                if (activeItems > 0) {
                    controls.style.display = 'flex';
                    controls.innerHTML = ''; 
                    
                    const uploadBtn = document.createElement('button');
                    uploadBtn.innerHTML = `Upload All (${activeItems})`; 
                    uploadBtn.style.cssText = 'background: var(--opuc-accent); color: #000; border: none; padding: 6px 14px; border-radius: 4px; font-weight: bold; cursor: pointer; transition: background-image 0.2s linear;';
                    
                    uploadBtn.onclick = async (e) => {
                        e.preventDefault();
                        const parentForm = uploadBtn.closest('.post.content') || document.getElementById('article-form-main');
                        const targetTextArea = parentForm.querySelector('textarea[name="body"]');
                        window.OPUcConfig.state.activeTextArea = targetTextArea;

                        if (this.isUploading) { this.isUploading = false; return; }
                        await this.flushQueue(uploadBtn, activeItems);
                    };
                    controls.appendChild(uploadBtn);
                } else {
                    controls.style.display = 'none';
                    if(window.OPUcUI) window.OPUcUI.toggleStagingAll(false);
                }
            });
        },

        flushQueue: async function(clickedUploadBtn, itemsToUpload) {
            this.isUploading = true;
            let completed = 0;

            document.querySelectorAll('.opuc-staging-controls button').forEach(btn => {
                btn.innerHTML = '✖ Cancel';
                btn.style.setProperty('background-image', 'linear-gradient(90deg, #F44336 0%, #aaa 0%)', 'important');
                btn.style.setProperty('color', '#fff', 'important');
            });

            for (let i = 0; i < this.queue.length; i++) {
                if (!this.isUploading) break; 
                const file = this.queue[i];
                if (file !== null) {
                    try {
                        // Extract metadata from the file object
                        const metadata = {
                            caption: file.opucCaption || '',
                            formatOverride: file.opucFormatOverride || ''
                        };
                        
                        await window.OPUcAPI.upload(file, metadata); // Pass to API
                        document.querySelectorAll(`.opuc-stage-tile[data-index="${i}"]`).forEach(t => t.style.opacity = '0.3');
                        this.queue[i] = null; 
                        completed++;
                        const pct = Math.round((completed / itemsToUpload) * 100);
                        document.querySelectorAll('.opuc-staging-controls button').forEach(btn => {
                            btn.style.setProperty('background-image', `linear-gradient(90deg, #F44336 ${pct}%, #aaa ${pct}%)`, 'important');
                        });
                    } catch (err) {}
                }
            }
            this.isUploading = false;
            this.renderAllStagedItems(); 
        },

        directUploadBatch: async function(filesArray) {
            this.isUploading = true;
            let completed = 0;
            const total = filesArray.length;
            window.OPUcUI.setWorkingState(() => { this.isUploading = false; });
            for (const file of filesArray) {
                if (!this.isUploading) break;
                try {
                    await window.OPUcAPI.upload(file, {}); // Empty metadata for direct upload
                    completed++;
                    window.OPUcUI.updateProgress(completed, total);
                } catch (err) {}
            }
            this.isUploading = false;
            window.OPUcUI.resetButtonState();
        }
    };

    window.OPUcCore = window.OPUcCore || {};
    window.OPUcCore.handleIncomingFiles = function(files) {
        const stagingEnabled = window.OPUcConfig.settings.stagingEnabled;
        const isLoggedIn = window.OPUcConfig.state.isLoggedIn;
        let filesArray = Array.from(files);

        if (!isLoggedIn) {
            const currentQueueSize = window.OPUcEditor.queue.filter(i => i !== null).length;
            if (filesArray.length > 1 || currentQueueSize >= 1) {
                if (currentQueueSize >= 1) return; else filesArray = [filesArray[0]]; 
            }
        }

        if (stagingEnabled) {
            window.OPUcUI.toggleStagingAll(true);
            filesArray.forEach(file => window.OPUcEditor.queue.push(file));
            window.OPUcEditor.renderAllStagedItems();
        } else {
            window.OPUcEditor.directUploadBatch(filesArray);
        }
    };
})();