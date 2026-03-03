// modules/11-image-processor.js
(function() {
    'use strict';

    const formatBytes = (bytes) => {
        if (!bytes || bytes === 0) return '0 B';
        const k = 1024; const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    window.OPUcImageProcessor = {
        cropperInstance: null,
        targetIndex: null,
        originalFile: null,
        originalDimensions: { w: 0, h: 0 },
        calcTimeout: null,

        init: function() {
            // Inject Cropper CSS if not present
            if (!document.getElementById('cropper-css')) {
                const link = document.createElement('link');
                link.id = 'cropper-css';
                link.rel = 'stylesheet';
                link.href = 'https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.6.1/cropper.min.css';
                document.head.appendChild(link);
            }
        },

        open: function(index) {
            this.init();
            const file = window.OPUcEditor.queue[index];
            if (!file) return;

            this.targetIndex = index;
            this.originalFile = file;

            let modal = document.getElementById('opuc-crop-modal');
            if (modal) modal.remove();

            modal = document.createElement('div');
            modal.id = 'opuc-crop-modal';
            modal.tabIndex = -1;
            modal.style.cssText = `position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.85); z-index: 2147483649; display: flex; flex-direction: column; align-items: center; justify-content: center; backdrop-filter: blur(8px); outline: none; font-family: var(--opuc-font);`;

            const container = document.createElement('div');
            container.className = 'opuc-scalable';
            container.style.cssText = `width: 95%; max-width: 900px; height: 90vh; background: var(--opuc-bg-secondary); border-radius: 8px; border: 1px solid var(--opuc-border); display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.5);`;

            // Header
            const header = document.createElement('div');
            header.style.cssText = 'padding: 12px 20px; background: rgba(0,0,0,0.05); border-bottom: 1px solid var(--opuc-border); display: flex; justify-content: space-between; align-items: center; color: var(--opuc-text-main); font-weight: bold;';
            header.innerHTML = `<span>✂️ Image Processor</span>`;
            const closeBtn = document.createElement('button');
            closeBtn.innerHTML = '✖';
            closeBtn.style.cssText = 'background: none; border: none; color: var(--opuc-text-main); font-size: 18px; cursor: pointer;';
            closeBtn.onclick = () => this.close();
            header.appendChild(closeBtn);

            // Main Body (Split View)
            const body = document.createElement('div');
            body.style.cssText = 'flex: 1; display: flex; flex-direction: column; overflow: hidden;';
            
            // Cropper Canvas Area
            const canvasArea = document.createElement('div');
            canvasArea.style.cssText = 'flex: 1; background: #111; display: flex; align-items: center; justify-content: center; overflow: hidden; position: relative; min-height: 200px;';
            const imgEl = document.createElement('img');
            imgEl.style.cssText = 'max-width: 100%; max-height: 100%; display: block;';
            canvasArea.appendChild(imgEl);

            // Controls Area
            const controlsArea = document.createElement('div');
            controlsArea.style.cssText = 'padding: 15px 20px; background: var(--opuc-bg-primary); border-top: 1px solid var(--opuc-border); display: flex; flex-direction: column; gap: 15px;';

            // Top Control Row (Presets & Dimensions)
            const topControls = document.createElement('div');
            topControls.style.cssText = 'display: flex; flex-wrap: wrap; gap: 20px; justify-content: space-between; align-items: center;';

            const presetGroup = document.createElement('div');
            presetGroup.style.cssText = 'display: flex; gap: 8px;';
            const createPresetBtn = (label, ratio) => {
                const btn = document.createElement('button');
                btn.innerText = label;
                btn.style.cssText = 'padding: 6px 12px; background: var(--opuc-bg-secondary); border: 1px solid var(--opuc-border); color: var(--opuc-text-main); border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: bold;';
                btn.onclick = () => this.cropperInstance.setAspectRatio(ratio);
                return btn;
            };
            presetGroup.appendChild(createPresetBtn('Free', NaN));
            presetGroup.appendChild(createPresetBtn('1:1', 1));
            presetGroup.appendChild(createPresetBtn('4:3', 4/3));
            presetGroup.appendChild(createPresetBtn('16:9', 16/9));

            const statsGroup = document.createElement('div');
            statsGroup.style.cssText = 'font-size: 12px; color: var(--opuc-text-muted); text-align: right; line-height: 1.6;';
            statsGroup.id = 'opuc-crop-stats';
            statsGroup.innerHTML = `<b>Original:</b> Loading...<br><b>New:</b> Calculating...`;

            topControls.appendChild(presetGroup);
            topControls.appendChild(statsGroup);
            controlsArea.appendChild(topControls);

            // Footer (Save/Cancel)
            const footer = document.createElement('div');
            footer.style.cssText = 'padding: 12px 20px; background: rgba(0,0,0,0.05); border-top: 1px solid var(--opuc-border); display: flex; justify-content: flex-end; gap: 10px;';
            
            const cancelBtn = document.createElement('button');
            cancelBtn.innerText = 'Cancel';
            cancelBtn.style.cssText = 'padding: 8px 16px; border-radius: 4px; border: 1px solid var(--opuc-border); background: transparent; color: var(--opuc-text-main); cursor: pointer; font-weight: bold;';
            cancelBtn.onclick = () => this.close();

            const saveBtn = document.createElement('button');
            saveBtn.innerText = 'Crop & Save';
            saveBtn.style.cssText = 'padding: 8px 20px; border-radius: 4px; border: none; background: var(--opuc-accent); color: #000; font-weight: bold; cursor: pointer;';
            saveBtn.onclick = () => this.applyCrop();

            footer.appendChild(cancelBtn);
            footer.appendChild(saveBtn);

            body.appendChild(canvasArea);
            body.appendChild(controlsArea);
            container.appendChild(header);
            container.appendChild(body);
            container.appendChild(footer);
            modal.appendChild(container);
            document.body.appendChild(modal);

            // Keyboard Escape
            modal.addEventListener('keydown', (e) => { if (e.key === 'Escape') this.close(); });
            modal.focus();

            // Load Image into Cropper
            const reader = new FileReader();
            reader.onload = (e) => {
                imgEl.src = e.target.result;
                const tempImg = new Image();
                tempImg.onload = () => {
                    this.originalDimensions = { w: tempImg.width, h: tempImg.height };
                    this.initCropper(imgEl);
                };
                tempImg.src = e.target.result;
            };
            reader.readAsDataURL(file);
        },

        initCropper: function(imgElement) {
            if (typeof Cropper === 'undefined') {
                alert("Cropper.js library failed to load.");
                return;
            }

            this.cropperInstance = new Cropper(imgElement, {
                viewMode: 1,
                dragMode: 'crop',
                autoCropArea: 0.9,
                restore: false,
                guides: true,
                center: true,
                highlight: false,
                cropBoxMovable: true,
                cropBoxResizable: true,
                toggleDragModeOnDblclick: true,
                crop: () => {
                    // Debounce the heavy file-size calculation so it doesn't lag the dragging
                    clearTimeout(this.calcTimeout);
                    this.calcTimeout = setTimeout(() => this.updateStatsUI(), 300);
                }
            });
        },

        updateStatsUI: function() {
            if (!this.cropperInstance) return;
            const statsBox = document.getElementById('opuc-crop-stats');
            if (!statsBox) return;

            const cropData = this.cropperInstance.getData(true); // Rounded values
            
            // Generate a real-time blob to get accurate file size
            const canvas = this.cropperInstance.getCroppedCanvas();
            if (!canvas) return;

            canvas.toBlob((blob) => {
                const origSizeStr = formatBytes(this.originalFile.size);
                const newSizeStr = formatBytes(blob.size);
                
                let colorClass = 'var(--opuc-success)';
                if (blob.size > this.originalFile.size) colorClass = 'var(--opuc-danger)';

                statsBox.innerHTML = `
                    <b>Original:</b> ${this.originalDimensions.w} x ${this.originalDimensions.h}px (${origSizeStr})<br>
                    <b>New Crop:</b> ${cropData.width} x ${cropData.height}px (<span style="color:${colorClass}; font-weight:bold;">${newSizeStr}</span>)
                `;
            }, 'image/jpeg', 0.85); // 85% is a good web standard
        },

        applyCrop: function() {
            if (!this.cropperInstance) return;
            
            const canvas = this.cropperInstance.getCroppedCanvas({
                imageSmoothingEnabled: true,
                imageSmoothingQuality: 'high',
            });

            canvas.toBlob((blob) => {
                // Generate new File object
                const ext = this.originalFile.name.split('.').pop().toLowerCase() || 'jpg';
                const finalExt = (ext === 'png') ? 'png' : 'jpeg';
                const newFileName = this.originalFile.name.replace(/\.[^/.]+$/, "") + `_cropped.${finalExt}`;
                
                const newFile = new File([blob], newFileName, { type: `image/${finalExt}` });
                
                // Preserve Metadata (Captions, Style overrides)
                newFile.opucCaption = this.originalFile.opucCaption;
                newFile.opucStyleOverride = this.originalFile.opucStyleOverride;

                // Replace in Queue
                window.OPUcEditor.queue[this.targetIndex] = newFile;
                
                // Refresh UI
                window.OPUcEditor.renderAllStagedItems();
                this.close();
            }, this.originalFile.type === 'image/png' ? 'image/png' : 'image/jpeg', 0.85);
        },

        close: function() {
            if (this.cropperInstance) {
                this.cropperInstance.destroy();
                this.cropperInstance = null;
            }
            const modal = document.getElementById('opuc-crop-modal');
            if (modal) modal.remove();
            this.targetIndex = null;
            this.originalFile = null;
        }
    };
})();