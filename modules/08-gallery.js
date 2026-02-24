// modules/08-gallery.js
(function() {
    'use strict';

    window.OPUcGallery = {
        currentPage: 1,
        isLoading: false,
        selectedImages: new Set(), // Keeps track of multi-select

        // 1. Build and Open the Overlay
        open: function() {
            if (window.OPUcLog) window.OPUcLog.info("Opening OPUc Gallery Overlay...");
            
            let modal = document.getElementById('opuc-gallery-modal');
            
            if (!modal) {
                // Create the modal if it doesn't exist
                modal = document.createElement('div');
                modal.id = 'opuc-gallery-modal';
                modal.style.cssText = `
                    position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
                    background: rgba(0,0,0,0.85); z-index: var(--opuc-z-index-overlay, 2147483647);
                    display: flex; flex-direction: column; align-items: center; justify-content: center;
                    backdrop-filter: blur(5px);
                `;

                const container = document.createElement('div');
                container.style.cssText = `
                    width: 90%; max-width: 1000px; height: 85%; background: var(--opuc-bg-primary, #2b2b2b);
                    border-radius: 8px; border: 1px solid var(--opuc-accent, #FF9800);
                    display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                `;

                // Header
                const header = document.createElement('div');
                header.style.cssText = 'padding: 15px; background: rgba(0,0,0,0.2); border-bottom: 1px solid rgba(255,255,255,0.1); display: flex; justify-content: space-between; align-items: center;';
                header.innerHTML = '<b style="color: var(--opuc-text-main, #fff); font-size: 18px;">🖼️ OPUc Gallery</b>';
                
                const closeBtn = document.createElement('button');
                closeBtn.innerHTML = '✖';
                closeBtn.style.cssText = 'background: none; border: none; color: #fff; font-size: 20px; cursor: pointer;';
                closeBtn.onclick = () => this.close();
                header.appendChild(closeBtn);

                // Grid Container
                const grid = document.createElement('div');
                grid.id = 'opuc-gallery-grid';
                grid.style.cssText = 'flex: 1; overflow-y: auto; padding: 15px; display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 10px; align-content: start;';
                
                // Infinite Scroll Listener
                grid.addEventListener('scroll', () => {
                    if (grid.scrollTop + grid.clientHeight >= grid.scrollHeight - 200) {
                        this.fetchPage(this.currentPage + 1);
                    }
                });

                // Footer Actions
                const footer = document.createElement('div');
                footer.style.cssText = 'padding: 15px; background: rgba(0,0,0,0.2); border-top: 1px solid rgba(255,255,255,0.1); display: flex; justify-content: space-between; align-items: center;';
                
                const statusText = document.createElement('span');
                statusText.id = 'opuc-gallery-status';
                statusText.style.cssText = 'color: #ccc; font-size: 14px;';
                statusText.innerText = '0 selected';

                const insertBtn = document.createElement('button');
                insertBtn.innerText = 'Insert Selected';
                insertBtn.style.cssText = 'background: var(--opuc-accent, #FF9800); color: #000; font-weight: bold; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;';
                insertBtn.onclick = () => this.insertSelected();

                footer.appendChild(statusText);
                footer.appendChild(insertBtn);

                container.appendChild(header);
                container.appendChild(grid);
                container.appendChild(footer);
                modal.appendChild(container);
                document.body.appendChild(modal);
            }

            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden'; // Prevent Okoun from scrolling behind modal

            // Fetch the first page if grid is empty
            if (document.getElementById('opuc-gallery-grid').innerHTML === '') {
                this.currentPage = 1;
                this.fetchPage(1);
            }
        },

        close: function() {
            const modal = document.getElementById('opuc-gallery-modal');
            if (modal) modal.style.display = 'none';
            document.body.style.overflow = '';
            
            // Clear selections on close
            this.selectedImages.clear();
            this.updateStatus();
            document.querySelectorAll('.opuc-gallery-item').forEach(el => el.style.border = '2px solid transparent');
        },

        // 2. Fetch from OPU API
        fetchPage: function(pageNum) {
            if (this.isLoading) return;
            this.isLoading = true;
            this.currentPage = pageNum;

            if (window.OPUcLog) window.OPUcLog.debug(`Fetching OPU gallery page ${pageNum}...`);

            const url = `${window.OPUcConfig.api.gallery}&recordStart=${pageNum}`;

            GM_xmlhttpRequest({
                method: 'GET',
                url: url,
                onload: (response) => {
                    if (response.finalUrl.includes('page=prihlaseni')) {
                        if (window.OPUcLog) window.OPUcLog.error("Not logged in to OPU.");
                        alert("Please log in to opu.peklo.biz first.");
                        this.close();
                        return;
                    }

                    this.parseHTMLAndRender(response.responseText);
                    this.isLoading = false;
                },
                onerror: () => {
                    if (window.OPUcLog) window.OPUcLog.error("Failed to fetch gallery page.");
                    this.isLoading = false;
                }
            });
        },

        // 3. Extract Images & Render
        parseHTMLAndRender: function(htmlString) {
            const doc = new DOMParser().parseFromString(htmlString, 'text/html');
            const boxes = doc.querySelectorAll('.box a.swipebox, .boxtop a.swipebox'); // Targeting OPU's native gallery structure
            const grid = document.getElementById('opuc-gallery-grid');

            if (boxes.length === 0) {
                if (window.OPUcLog) window.OPUcLog.debug("No more images found.");
                return;
            }

            boxes.forEach(a => {
                const fullUrl = a.href;
                // Try to grab the thumbnail, fallback to full image if missing
                const imgNode = a.querySelector('img');
                const thumbUrl = imgNode ? imgNode.src : fullUrl;

                const wrapper = document.createElement('div');
                wrapper.className = 'opuc-gallery-item';
                wrapper.style.cssText = 'width: 100%; aspect-ratio: 1; border: 2px solid transparent; border-radius: 4px; overflow: hidden; cursor: pointer; transition: transform 0.1s; background: #000;';
                
                const img = document.createElement('img');
                img.src = thumbUrl;
                img.style.cssText = 'width: 100%; height: 100%; object-fit: cover; opacity: 0.8;';

                wrapper.onclick = () => this.toggleSelection(wrapper, fullUrl, img);
                
                wrapper.appendChild(img);
                grid.appendChild(wrapper);
            });
        },

        // 4. Multi-Select Logic
        toggleSelection: function(wrapper, url, img) {
            if (this.selectedImages.has(url)) {
                this.selectedImages.delete(url);
                wrapper.style.border = '2px solid transparent';
                wrapper.style.transform = 'scale(1)';
                img.style.opacity = '0.8';
            } else {
                this.selectedImages.add(url);
                wrapper.style.border = '2px solid var(--opuc-accent, #FF9800)';
                wrapper.style.transform = 'scale(0.95)';
                img.style.opacity = '1';
            }
            this.updateStatus();
        },

        updateStatus: function() {
            const status = document.getElementById('opuc-gallery-status');
            if (status) status.innerText = `${this.selectedImages.size} selected`;
        },

        // 5. Inject to Okoun
        insertSelected: function() {
            if (this.selectedImages.size === 0) return;

            if (window.OPUcLog) window.OPUcLog.info(`Inserting ${this.selectedImages.size} image(s) from gallery.`);

            // Ensure the API module is available to handle formatting/injection
            if (window.OPUcAPI && window.OPUcAPI.injectIntoOkoun) {
                this.selectedImages.forEach(url => {
                    window.OPUcAPI.injectIntoOkoun(url);
                });
            } else {
                if (window.OPUcLog) window.OPUcLog.error("OPUcAPI module not found! Cannot inject.");
            }

            this.close();
        }
    };
})();
