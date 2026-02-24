// modules/06-editor.js
(function() {
    'use strict';

    window.OPUcEditor = {
        queue: [], 
        isUploading: false, // Flag to track upload state

        createThumbnail: function(file, callback) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    const MAX_WIDTH = 100;
                    const MAX_HEIGHT = 100;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
                    } else {
                        if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
                    }
                    canvas.width = width; canvas.height = height;
                    ctx.drawImage(img, 0, 0, width, height);
                    callback(canvas.toDataURL('image/jpeg', 0.8));
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        },

        renderStagedItem: function(file, index) {
            const container = document.createElement('div');
            container.style.cssText = 'position: relative; width: 80px; height: 80px; border: 1px solid var(--opuc-border); border-radius: 4px; overflow: hidden; background: #000; box-shadow: 0 2px 5px rgba(0,0,0,0.2);';
            container.dataset.index = index;

            const imgPreview = document.createElement('img');
            imgPreview.style.cssText = 'width: 100%; height: 100%; object-fit: cover; opacity: 0.5; transition: opacity 0.2s;';
            container.appendChild(imgPreview);

            this.createThumbnail(file, (thumbData) => {
                imgPreview.src = thumbData;
                imgPreview.style.opacity = '1';
            });

            const removeBtn = document.createElement('button');
            removeBtn.innerHTML = '✖';
            removeBtn.style.cssText = 'position: absolute; top: 2px; right: 2px; background: rgba(244, 67, 54, 0.9); color: white; border: none; border-radius: 50%; width: 18px; height: 18px; font-size: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center;';
            removeBtn.onclick = (e) => {
                e.preventDefault();
                this.removeFromQueue(index, container);
            };

            container.appendChild(removeBtn);
            return container;
        },

        removeFromQueue: function(index, visualElement) {
            this.queue[index] = null; 
            visualElement.remove();
            this.refreshControls();
        },

        refreshControls: function() {
            const controls = document.getElementById('opuc-staging-controls');
            if (!controls) return;
            
            const activeItems = this.queue.filter(item => item !== null).length;
            
            if (activeItems > 0) {
                controls.style.display = 'flex';
                controls.innerHTML = ''; 
                
                const uploadBtn = document.createElement('button');
                uploadBtn.innerHTML = `🚀 Upload All (${activeItems})`;
                uploadBtn.style.cssText = 'background: var(--opuc-accent); color: #000; border: none; padding: 6px 14px; border-radius: 4px; font-weight: bold; cursor: pointer;';
                
                uploadBtn.onclick = async (e) => {
                    e.preventDefault();
                    uploadBtn.innerHTML = 'Uploading...';
                    uploadBtn.disabled = true;
                    await this.flushQueue();
                };
                
                controls.appendChild(uploadBtn);
            } else {
                controls.style.display = 'none';
                window.OPUcUI.toggleStaging(false);
            }
        },

        flushQueue: async function() {
            if (window.OPUcLog) window.OPUcLog.info("Flushing staging queue to API...");
            
            this.isUploading = true;
            let completed = 0;
            const itemsToUpload = this.queue.filter(f => f !== null).length;

            // Turn button into Cancel/Progress bar
            window.OPUcUI.setWorkingState(() => {
                this.isUploading = false; // Flag triggers loop break
                if (window.OPUcLog) window.OPUcLog.warn("Batch upload aborted by user.");
            });

            for (let i = 0; i < this.queue.length; i++) {
                if (!this.isUploading) break; // User clicked Cancel

                const file = this.queue[i];
                if (file !== null) {
                    try {
                        await window.OPUcAPI.upload(file);
                        const visualItem = document.querySelector(`div[data-index="${i}"]`);
                        if (visualItem) visualItem.style.opacity = '0.3'; 
                        completed++;
                        window.OPUcUI.updateProgress(completed, itemsToUpload);
                    } catch (err) {}
                }
            }
            
            if (!this.isUploading) {
                // If cancelled, keep the remaining queue so they don't lose data
                this.queue = this.queue.filter(f => f !== null); 
            } else {
                // Fully finished
                this.queue = [];
                const stagingItems = document.getElementById('opuc-staging-items');
                if (stagingItems) stagingItems.innerHTML = '';
            }
            
            this.isUploading = false;
            window.OPUcUI.resetButtonState();
            this.refreshControls();
        }
    };

    window.OPUcCore = window.OPUcCore || {};
    window.OPUcCore.handleIncomingFiles = function(files) {
        const stagingEnabled = window.OPUcConfig.settings.stagingEnabled;
        const stagingItems = document.getElementById('opuc-staging-items');
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

        filesArray.forEach(file => {
            if (stagingEnabled) {
                window.OPUcUI.toggleStaging(true);
                const newIndex = window.OPUcEditor.queue.length;
                window.OPUcEditor.queue.push(file);
                
                const visualItem = window.OPUcEditor.renderStagedItem(file, newIndex);
                if (stagingItems) stagingItems.appendChild(visualItem);
                
                window.OPUcEditor.refreshControls();
            } else {
                window.OPUcAPI.upload(file);
            }
        });
    };
})();
