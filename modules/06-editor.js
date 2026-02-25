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
                    let width = img.width;
                    let height = img.height;
                    const origWidth = width;
                    const origHeight = height;

                    if (width > height) {
                        if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
                    } else {
                        if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
                    }
                    canvas.width = width; canvas.height = height;
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    callback(canvas.toDataURL('image/jpeg', 0.8), origWidth, origHeight);
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        },

        renderAllStagedItems: function() {
            const stagingItems = document.getElementById('opuc-staging-items');
            if (!stagingItems) return;
            stagingItems.innerHTML = ''; 
            
            this.queue = this.queue.filter(f => f !== null);
            
            this.queue.forEach((file, index) => {
                const tile = this.renderStagedItem(file, index);
                stagingItems.appendChild(tile);
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

            // --- DRAG TO INSERT LOGIC ---
            container.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', index);
                setTimeout(() => container.style.opacity = '0.4', 0);
            });
            
            container.addEventListener('dragend', () => {
                container.style.opacity = '1';
                document.querySelectorAll('.opuc-stage-tile').forEach(el => {
                    el.classList.remove('opuc-drag-left', 'opuc-drag-right');
                });
            });
            
            container.addEventListener('dragover', (e) => {
                e.preventDefault();
                const rect = container.getBoundingClientRect();
                const midPoint = rect.left + rect.width / 2;
                
                // Clear sibling animations
                document.querySelectorAll('.opuc-stage-tile').forEach(el => {
                    if (el !== container) el.classList.remove('opuc-drag-left', 'opuc-drag-right');
                });

                // Apply squeeze animation based on cursor side
                if (e.clientX < midPoint) {
                    container.classList.add('opuc-drag-left');
                    container.classList.remove('opuc-drag-right');
                } else {
                    container.classList.add('opuc-drag-right');
                    container.classList.remove('opuc-drag-left');
                }
            });
            
            container.addEventListener('dragleave', () => {
                container.classList.remove('opuc-drag-left', 'opuc-drag-right');
            });
            
            container.addEventListener('drop', (e) => {
                e.preventDefault();
                container.classList.remove('opuc-drag-left', 'opuc-drag-right');
                
                const draggedIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
                
                if (!isNaN(draggedIndex) && draggedIndex !== index) {
                    const rect = container.getBoundingClientRect();
                    const insertBefore = e.clientX < (rect.left + rect.width / 2);
                    
                    // Slice the old item out
                    const itemToMove = this.queue.splice(draggedIndex, 1)[0];
                    
                    // Adjust insertion index
                    let targetIndex = index;
                    if (draggedIndex < index) targetIndex--; 
                    if (!insertBefore) targetIndex++; 
                    
                    // Splice it back in at the new position
                    this.queue.splice(targetIndex, 0, itemToMove);
                    this.renderAllStagedItems();
                }
            });

            // --- UI CONSTRUCTION ---
            const topHalf = document.createElement('div');
            topHalf.style.cssText = 'position: relative; height: 90px; background: #000;';

            const imgPreview = document.createElement('img');
            imgPreview.style.cssText = 'width: 100%; height: 100%; object-fit: cover; opacity: 0.5; transition: opacity 0.2s; pointer-events: none;';
            topHalf.appendChild(imgPreview);

            const removeBtn = document.createElement('button');
            removeBtn.innerHTML = '✖';
            removeBtn.title = 'Remove';
            removeBtn.style.cssText = 'position: absolute; top: 4px; left: 4px; background: rgba(244, 67, 54, 0.9); color: white; border: none; border-radius: 4px; width: 22px; height: 22px; font-size: 11px; cursor: pointer; display: flex; align-items: center; justify-content: center; z-index: 10;';
            removeBtn.onclick = (e) => { e.preventDefault(); this.removeFromQueue(index); };
            topHalf.appendChild(removeBtn);

            const editBtn = document.createElement('button');
            editBtn.innerHTML = '✏️';
            editBtn.title = 'Edit Caption/Format';
            editBtn.style.cssText = 'position: absolute; top: 4px; right: 4px; background: rgba(255, 152, 0, 0.9); color: black; border: none; border-radius: 4px; width: 22px; height: 22px; font-size: 11px; cursor: pointer; display: flex; align-items: center; justify-content: center; z-index: 10;';
            editBtn.onclick = (e) => { e.preventDefault(); alert("Caption editor coming in next update!"); };
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
            
            const sizeSpan = document.createElement('span');
            sizeSpan.innerText = formatBytes(file.size);
            
            const resSpan = document.createElement('span');
            resSpan.innerText = '...'; 

            metaLbl.appendChild(sizeSpan);
            metaLbl.appendChild(resSpan);
            bottomHalf.appendChild(metaLbl);
            container.appendChild(bottomHalf);

            this.createThumbnail(file, (thumbData, w, h) => {
                imgPreview.src = thumbData;
                imgPreview.style.opacity = '1';
                resSpan.innerText = `${w}x${h}`;
            });

            return container;
        },

        removeFromQueue: function(index) {
            this.queue[index] = null; 
            this.renderAllStagedItems();
        },

        refreshControls: function() {
            const controls = document.getElementById('opuc-staging-controls');
            if (!controls) return;
            
            const activeItems = this.queue.filter(item => item !== null).length;
            
            if (activeItems > 0) {
                controls.style.display = 'flex';
                controls.innerHTML = ''; 
                
                const uploadBtn = document.createElement('button');
                uploadBtn.innerHTML = `Upload All (${activeItems})`; 
                uploadBtn.style.cssText = 'background: var(--opuc-accent); color: #000; border: none; padding: 6px 14px; border-radius: 4px; font-weight: bold; cursor: pointer; transition: background-image 0.2s linear;';
                
                uploadBtn.onclick = async (e) => {
                    e.preventDefault();
                    if (this.isUploading) {
                        this.isUploading = false; 
                        if (window.OPUcLog) window.OPUcLog.warn("Batch upload aborted by user.");
                        return;
                    }
                    await this.flushQueue(uploadBtn, activeItems);
                };
                
                controls.appendChild(uploadBtn);
            } else {
                controls.style.display = 'none';
                window.OPUcUI.toggleStaging(false);
            }
        },

        flushQueue: async function(uploadBtn, itemsToUpload) {
            if (window.OPUcLog) window.OPUcLog.info("Flushing staging queue to API...");
            
            this.isUploading = true;
            let completed = 0;

            uploadBtn.innerHTML = '✖ Cancel';
            uploadBtn.style.setProperty('background-image', 'linear-gradient(90deg, #F44336 0%, #aaa 0%)', 'important');
            uploadBtn.style.setProperty('color', '#fff', 'important');
            uploadBtn.style.setProperty('text-shadow', '1px 1px 1px rgba(0,0,0,0.5)', 'important');

            for (let i = 0; i < this.queue.length; i++) {
                if (!this.isUploading) break; 

                const file = this.queue[i];
                if (file !== null) {
                    try {
                        await window.OPUcAPI.upload(file);
                        const visualItem = document.querySelector(`div[data-index="${i}"]`);
                        if (visualItem) visualItem.style.opacity = '0.3'; 
                        
                        this.queue[i] = null; 
                        completed++;
                        const pct = Math.round((completed / itemsToUpload) * 100);
                        uploadBtn.style.setProperty('background-image', `linear-gradient(90deg, #F44336 ${pct}%, #aaa ${pct}%)`, 'important');
                    } catch (err) {}
                }
            }
            
            this.isUploading = false;
            this.renderAllStagedItems(); 
        },

        directUploadBatch: async function(filesArray) {
            if (window.OPUcLog) window.OPUcLog.info("Starting direct upload batch...");
            
            this.isUploading = true;
            let completed = 0;
            const total = filesArray.length;

            window.OPUcUI.setWorkingState(() => {
                this.isUploading = false;
                if (window.OPUcLog) window.OPUcLog.warn("Direct batch upload aborted by user.");
            });

            for (const file of filesArray) {
                if (!this.isUploading) break;
                try {
                    await window.OPUcAPI.upload(file);
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
                const t = document.createElement('div');
                t.innerText = "Anon mode limited to 1 file. Log in for batch uploads.";
                t.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#F44336;color:#fff;padding:8px 16px;border-radius:20px;z-index:999999;font-weight:bold;';
                document.body.appendChild(t);
                setTimeout(()=>t.remove(), 3500);

                if (currentQueueSize >= 1) return; 
                else filesArray = [filesArray[0]]; 
            }
        }

        if (stagingEnabled) {
            window.OPUcUI.toggleStaging(true);
            filesArray.forEach(file => {
                window.OPUcEditor.queue.push(file);
            });
            window.OPUcEditor.renderAllStagedItems();
        } else {
            window.OPUcEditor.directUploadBatch(filesArray);
        }
    };
})();
