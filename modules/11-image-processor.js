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
        keyHandler: null,

        init: function() {
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
            modal.style.cssText = `position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.85); z-index: 2147483649; display: flex; flex-direction: column; align-items: center; justify-content: center; backdrop-filter: blur(8px); outline: none; font-family: var(--opuc-font);`;

            const container = document.createElement('div');
            container.className = 'opuc-scalable';
            container.style.cssText = `width: 95%; max-width: 900px; max-height: 90vh; background: var(--opuc-bg-secondary); border-radius: 8px; border: 1px solid var(--opuc-border); display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.5);`;

            const header = document.createElement('div');
            header.style.cssText = 'padding: 12px 20px; background: rgba(0,0,0,0.05); border-bottom: 1px solid var(--opuc-border); display: flex; justify-content: space-between; align-items: center; color: var(--opuc-text-main); font-weight: bold; flex-shrink: 0;';
            header.innerHTML = `<span>✂️ Image Processor</span>`;
            const closeBtn = document.createElement('button');
            closeBtn.innerHTML = '✖';
            closeBtn.style.cssText = 'background: none; border: none; color: var(--opuc-text-main); font-size: 18px; cursor: pointer;';
            closeBtn.onclick = () => this.close();
            header.appendChild(closeBtn);

            const body = document.createElement('div');
            body.style.cssText = 'flex: 1; display: flex; flex-direction: column; overflow: hidden;';
            
            const canvasArea = document.createElement('div');
            canvasArea.style.cssText = 'flex: 1; background: #111; display: flex; align-items: center; justify-content: center; overflow: hidden; position: relative; min-height: 200px;';
            const imgEl = document.createElement('img');
            imgEl.style.cssText = 'max-width: 100%; max-height: 100%; display: block;';
            canvasArea.appendChild(imgEl);

            const controlsArea = document.createElement('div');
            controlsArea.style.cssText = 'padding: 15px 20px; background: var(--opuc-bg-primary); border-top: 1px solid var(--opuc-border); display: flex; flex-direction: column; gap: 15px; overflow-y: auto; flex-shrink: 0;';

            const topControls = document.createElement('div');
            topControls.style.cssText = 'display: flex; flex-wrap: wrap; gap: 15px; justify-content: space-between; align-items: center;';

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

            // FIXED: New UI layout with the Percentage sync field
            const resizeGroup = document.createElement('div');
            resizeGroup.style.cssText = 'display: flex; gap: 6px; align-items: center; color: var(--opuc-text-main); font-size: 12px; font-weight: bold; background: rgba(0,0,0,0.05); padding: 4px 8px; border-radius: 4px; border: 1px solid var(--opuc-border);';
            resizeGroup.innerHTML = `
                Out: 
                <input type="text" id="opuc-crop-w" placeholder="W" title="Output Width" style="width: 45px; padding: 4px; background: var(--opuc-bg-secondary); border: 1px solid var(--opuc-border); color: var(--opuc-text-main); border-radius: 3px; text-align: center; font-size: 12px; outline: none; font-family: monospace;"> x 
                <input type="text" id="opuc-crop-h" placeholder="H" title="Output Height" style="width: 45px; padding: 4px; background: var(--opuc-bg-secondary); border: 1px solid var(--opuc-border); color: var(--opuc-text-main); border-radius: 3px; text-align: center; font-size: 12px; outline: none; font-family: monospace;"> px
                &nbsp;|&nbsp;
                <input type="text" id="opuc-crop-p" placeholder="%" title="Percentage" style="width: 35px; padding: 4px; background: var(--opuc-bg-secondary); border: 1px solid var(--opuc-border); color: var(--opuc-text-main); border-radius: 3px; text-align: center; font-size: 12px; outline: none; font-family: monospace;"> %
            `;
            
            topControls.appendChild(presetGroup); 
            topControls.appendChild(resizeGroup);
            
            const statsGroup = document.createElement('div');
            statsGroup.style.cssText = 'font-size: 12px; color: var(--opuc-text-muted); text-align: right; line-height: 1.6;';
            statsGroup.id = 'opuc-crop-stats';
            statsGroup.innerHTML = `<b>Original:</b> Loading...<br><b>New:</b> Calculating...`;
            topControls.appendChild(statsGroup); 
            
            controlsArea.appendChild(topControls);

            const footer = document.createElement('div');
            footer.style.cssText = 'padding: 12px 20px; background: rgba(0,0,0,0.05); border-top: 1px solid var(--opuc-border); display: flex; justify-content: flex-end; gap: 10px; flex-shrink: 0;';
            
            const cancelBtn = document.createElement('button');
            cancelBtn.innerText = 'Cancel';
            cancelBtn.style.cssText = 'padding: 8px 16px; border-radius: 4px; border: 1px solid var(--opuc-border); background: transparent; color: var(--opuc-text-main); cursor: pointer; font-weight: bold;';
            cancelBtn.onclick = () => this.close();

            const saveBtn = document.createElement('button');
            saveBtn.innerText = 'Crop & Save';
            saveBtn.style.cssText = 'padding: 8px 20px; border-radius: 4px; border: none; background: var(--opuc-accent); color: #000; font-weight: bold; cursor: pointer;';
            saveBtn.onclick = () => this.applyCrop();

            this.keyHandler = (e) => {
                if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); this.close(); }
                if (e.key === 'Enter' && e.target.tagName !== 'INPUT') { e.preventDefault(); e.stopPropagation(); this.applyCrop(); }
            };
            document.addEventListener('keydown', this.keyHandler, true);

            footer.appendChild(cancelBtn); footer.appendChild(saveBtn);
            body.appendChild(canvasArea); body.appendChild(controlsArea);
            container.appendChild(header); container.appendChild(body); container.appendChild(footer);
            modal.appendChild(container); document.body.appendChild(modal);

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
            if (typeof Cropper === 'undefined') { alert("Cropper.js failed to load."); return; }
            
            const glob = window.OPUcConfig.settings.autoResize || '100%';
            let initW = ''; let initH = ''; let initP = '';
            
            if (glob.endsWith('%')) {
                const p = parseInt(glob);
                if (!isNaN(p) && p > 0 && p !== 100) {
                    initP = p;
                    initW = Math.round(this.originalDimensions.w * (p/100));
                    initH = Math.round(this.originalDimensions.h * (p/100));
                }
            } else if (glob.includes('x')) {
                const parts = glob.toLowerCase().split('x');
                if (parts[0] && parseInt(parts[0])) initW = parseInt(parts[0]);
                if (parts.length > 1 && parts[1] && parseInt(parts[1])) initH = parseInt(parts[1]);
            }
            
            const inputW = document.getElementById('opuc-crop-w');
            const inputH = document.getElementById('opuc-crop-h');
            const inputP = document.getElementById('opuc-crop-p');
            
            inputW.value = initW; inputH.value = initH; inputP.value = initP;

            // SYNC ENGINE
            const debounceUpdate = () => { clearTimeout(this.calcTimeout); this.calcTimeout = setTimeout(() => this.updateStatsUI(), 300); };
            
            inputP.addEventListener('input', (e) => {
                const pVal = parseInt(e.target.value);
                if (!isNaN(pVal) && pVal > 0) {
                    inputW.value = Math.round(this.originalDimensions.w * (pVal/100));
                    inputH.value = Math.round(this.originalDimensions.h * (pVal/100));
                    debounceUpdate();
                }
            });

            const clearP = () => { inputP.value = ''; debounceUpdate(); };
            inputW.addEventListener('input', clearP);
            inputH.addEventListener('input', clearP);

            this.cropperInstance = new Cropper(imgElement, {
                viewMode: 1, dragMode: 'crop', autoCropArea: 0.9, restore: false, guides: true,
                center: true, highlight: false, cropBoxMovable: true, cropBoxResizable: true,
                toggleDragModeOnDblclick: true,
                crop: debounceUpdate
            });
        },

        updateStatsUI: function() {
            if (!this.cropperInstance) return;
            const statsBox = document.getElementById('opuc-crop-stats');
            if (!statsBox) return;

            let opts = { imageSmoothingEnabled: true, imageSmoothingQuality: 'high' };
            const outW = parseInt(document.getElementById('opuc-crop-w').value);
            const outH = parseInt(document.getElementById('opuc-crop-h').value);
            if (!isNaN(outW) && outW > 0) opts.width = outW;
            if (!isNaN(outH) && outH > 0) opts.height = outH;

            const canvas = this.cropperInstance.getCroppedCanvas(opts);
            if (!canvas) return;

            canvas.toBlob((blob) => {
                const origSizeStr = formatBytes(this.originalFile.size);
                const newSizeStr = formatBytes(blob.size);
                let colorClass = 'var(--opuc-success)';
                if (blob.size > this.originalFile.size) colorClass = 'var(--opuc-danger)';

                statsBox.innerHTML = `<b>Original:</b> ${this.originalDimensions.w} x ${this.originalDimensions.h}px (${origSizeStr})<br>
                                      <b>New Output:</b> ${canvas.width} x ${canvas.height}px (<span style="color:${colorClass}; font-weight:bold;">${newSizeStr}</span>)`;
            }, 'image/jpeg', 0.85); 
        },

        applyCrop: function() {
            if (!this.cropperInstance) return;
            
            let opts = { imageSmoothingEnabled: true, imageSmoothingQuality: 'high' };
            const outW = parseInt(document.getElementById('opuc-crop-w').value);
            const outH = parseInt(document.getElementById('opuc-crop-h').value);
            if (!isNaN(outW) && outW > 0) opts.width = outW;
            if (!isNaN(outH) && outH > 0) opts.height = outH;

            const canvas = this.cropperInstance.getCroppedCanvas(opts);

            canvas.toBlob((blob) => {
                const ext = this.originalFile.name.split('.').pop().toLowerCase() || 'jpg';
                const finalExt = (ext === 'png') ? 'png' : 'jpeg';
                const newFileName = this.originalFile.name.replace(/\.[^/.]+$/, "") + `_cropped.${finalExt}`;
                const newFile = new File([blob], newFileName, { type: `image/${finalExt}` });
                
                newFile.opucOriginalFile = this.originalFile.opucOriginalFile || this.originalFile;
                newFile.opucCaption = this.originalFile.opucCaption;
                newFile.opucStyleOverride = this.originalFile.opucStyleOverride;

                window.OPUcEditor.queue[this.targetIndex] = newFile;
                window.OPUcEditor.renderAllStagedItems();
                this.close();
            }, this.originalFile.type === 'image/png' ? 'image/png' : 'image/jpeg', 0.85);
        },

        close: function() {
            if (this.keyHandler) { document.removeEventListener('keydown', this.keyHandler, true); this.keyHandler = null; }
            if (this.cropperInstance) { this.cropperInstance.destroy(); this.cropperInstance = null; }
            const modal = document.getElementById('opuc-crop-modal');
            if (modal) modal.remove();
            this.targetIndex = null;
            this.originalFile = null;
        }
    };
})();