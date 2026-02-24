// modules/06-editor.js
(function() {
    'use strict';

    window.OPUcEditor = {
        queue: [], // Holds the files currently in staging

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
            if (window.OPUcLog) window.OPUcLog.debug(`Removing file at index ${index} from staging queue.`);
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
                controls.innerHTML = ''; // Clear existing
                
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
            
            // Process uploads sequentially to preserve layout order in the text box
            for (let i = 0; i < this.queue.length; i++) {
                const file = this.queue[i];
                if (file !== null) {
                    try {
                        await window.OPUcAPI.upload(file);
                        // Visual feedback that this specific image finished
                        const visualItem = document.querySelector(`div[data-index="${i}"]`);
                        if (visualItem) visualItem.style.opacity = '0.3'; 
                    } catch (err) {
                        if (window.OPUcLog) window.OPUcLog.error(`Failed to upload item ${i}`, err);
                    }
                }
            }
            
            // Clear everything once done
            this.queue = [];
            const stagingItems = document.getElementById('opuc-staging-items');
            if (stagingItems) stagingItems.innerHTML = '';
            this.refreshControls();
            
            if (window.OPUcLog) window.OPUcLog.info("Staging queue flushed and cleared.");
        }
    };

    window.OPUcCore = window.OPUcCore || {};
    window.OPUcCore.handleIncomingFiles = function(files) {
        const stagingEnabled = window.OPUcConfig.settings.stagingEnabled;
        const stagingItems = document.getElementById('opuc-staging-items');

        Array.from(files).forEach(file => {
            if (stagingEnabled) {
                window.OPUcUI.toggleStaging(true);
                const newIndex = window.OPUcEditor.queue.length;
                window.OPUcEditor.queue.push(file);
                
                const visualItem = window.OPUcEditor.renderStagedItem(file, newIndex);
                if (stagingItems) stagingItems.appendChild(visualItem);
                
                window.OPUcEditor.refreshControls();
            } else {
                if (window.OPUcLog) window.OPUcLog.info("Staging disabled. Firing direct upload...");
                window.OPUcAPI.upload(file);
            }
        });
    };
})();
