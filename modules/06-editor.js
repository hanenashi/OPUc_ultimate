// modules/06-editor.js
(function() {
    'use strict';

    window.OPUcEditor = {
        queue: [], // Holds the files currently in staging

        // 1. Generate a local thumbnail via Canvas/FileReader
        createThumbnail: function(file, callback) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    // Create a mini canvas to save memory instead of rendering huge blobs
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    const MAX_WIDTH = 100;
                    const MAX_HEIGHT = 100;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }
                    canvas.width = width;
                    canvas.height = height;
                    ctx.drawImage(img, 0, 0, width, height);
                    callback(canvas.toDataURL('image/jpeg', 0.8));
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        },

        // 2. Build the visual item in the Staging Ribbon
        renderStagedItem: function(file, index) {
            const container = document.createElement('div');
            container.style.cssText = 'position: relative; width: 80px; height: 80px; border: 1px solid var(--opuc-border); border-radius: 4px; overflow: hidden; background: #000;';
            container.dataset.index = index;

            const imgPreview = document.createElement('img');
            imgPreview.style.cssText = 'width: 100%; height: 100%; object-fit: cover; opacity: 0.5; transition: opacity 0.2s;';
            container.appendChild(imgPreview);

            // Generate and set the thumbnail
            this.createThumbnail(file, (thumbData) => {
                imgPreview.src = thumbData;
                imgPreview.style.opacity = '1';
            });

            // Remove Button
            const removeBtn = document.createElement('button');
            removeBtn.innerHTML = '✖';
            removeBtn.style.cssText = 'position: absolute; top: 2px; right: 2px; background: rgba(244, 67, 54, 0.8); color: white; border: none; border-radius: 50%; width: 20px; height: 20px; font-size: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center;';
            removeBtn.onclick = (e) => {
                e.preventDefault();
                this.removeFromQueue(index);
                container.remove();
                if (this.queue.length === 0) window.OPUcUI.toggleStaging(false);
            };

            // TODO for later: Add "⚙ Edit" button for cropping

            container.appendChild(removeBtn);
            return container;
        },

        removeFromQueue: function(index) {
            if (window.OPUcLog) window.OPUcLog.debug(`Removing file at index ${index} from staging queue.`);
            this.queue[index] = null; // Nullify instead of splice to preserve indexing for currently rendering items
        },

        clearQueue: function() {
            this.queue = [];
            const stagingArea = document.getElementById('opuc-staging-area');
            if (stagingArea) {
                // Remove all child elements except the help text
                Array.from(stagingArea.children).forEach(child => {
                    if (child.tagName !== 'SPAN') stagingArea.removeChild(child);
                });
            }
            window.OPUcUI.toggleStaging(false);
        }
    };

    // Override the stub from 05-interceptors.js with the real logic
    window.OPUcCore = window.OPUcCore || {};
    window.OPUcCore.handleIncomingFiles = function(files) {
        const stagingEnabled = window.OPUcConfig.settings.stagingEnabled;
        const stagingArea = document.getElementById('opuc-staging-area');

        Array.from(files).forEach(file => {
            if (window.OPUcLog) window.OPUcLog.info(`Processing file: ${file.name || 'Clipboard Image'} (${file.type})`);
            
            if (stagingEnabled) {
                // Route to Staging Ribbon
                window.OPUcUI.toggleStaging(true);
                const newIndex = window.OPUcEditor.queue.length;
                window.OPUcEditor.queue.push(file);
                
                const visualItem = window.OPUcEditor.renderStagedItem(file, newIndex);
                if (stagingArea) stagingArea.appendChild(visualItem);
                
            } else {
                // Fast & Dirty Direct Upload
                if (window.OPUcLog) window.OPUcLog.info("Staging disabled. Firing direct upload...");
                window.OPUcAPI.upload(file);
            }
        });
    };
})();
