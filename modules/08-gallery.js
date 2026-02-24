// modules/08-gallery.js
(function() {
    'use strict';

    window.OPUcGallery = {
        currentPage: 1,
        isLoading: false,
        hasMore: true,
        selectedImages: new Set(),
        observer: null,

        open: function() {
            if (window.OPUcLog) window.OPUcLog.info("Opening OPUc Gallery Overlay...");
            
            let modal = document.getElementById('opuc-gallery-modal');
            
            if (!modal) {
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

                const header = document.createElement('div');
                header.style.cssText = 'padding: 15px; background: rgba(0,0,0,0.2); border-bottom: 1px solid rgba(255,255,255,0.1); display: flex; justify-content: space-between; align-items: center;';
                header.innerHTML = '<b style="color: var(--opuc-text-main, #fff); font-size: 18px;">🖼️ OPUc Gallery</b>';
                
                const closeBtn = document.createElement('button');
                closeBtn.innerHTML = '✖';
                closeBtn.style.cssText = 'background: none; border: none; color: #fff; font-size: 20px; cursor: pointer;';
                closeBtn.onclick = () => this.close();
                header.appendChild(closeBtn);

                const grid = document.createElement('div');
                grid.id = 'opuc-gallery-grid';
                grid.style.cssText = 'flex: 1; overflow-y: auto; padding: 15px; display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 10px; align-content: start;';
                
                // THE FIX: Intersection Observer instead of buggy scroll math
                this.observer = new IntersectionObserver((entries) => {
                    if (entries[0].isIntersecting && !this.isLoading && this.hasMore) {
                        if (window.OPUcLog) window.OPUcLog.debug("Sentinel reached. Fetching next page...");
                        this.fetchPage(this.currentPage + 1);
                    }
                }, { root: grid, rootMargin: '300px' });

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
            document.body.style.overflow = 'hidden';

            if (document.getElementById('opuc-gallery-grid').innerHTML === '') {
                this.currentPage = 1;
                this.hasMore = true;
                this.fetchPage(1);
            }
        },

        close: function() {
            const modal = document.getElementById('opuc-gallery-modal');
            if (modal) modal.style.display = 'none';
            document.body.style.overflow = '';
            
            this.selectedImages.clear();
            this.updateStatus();
            document.querySelectorAll('.opuc-gallery-item').forEach(el => el.style.border = '2px solid transparent');
        },

        fetchPage: function(pageNum) {
            if (this.isLoading || !this.hasMore) return;
            
            this.isLoading = true;
            this.currentPage = pageNum;

            if (window.OPUcLog) window.OPUcLog.debug(`Fetching OPU gallery page ${pageNum}...`);

            GM_xmlhttpRequest({
                method: 'GET',
                url: `${window.OPUcConfig.api.gallery}&recordStart=${pageNum}`,
                onload: (response) => {
                    if (response.finalUrl.includes('page=prihlaseni')) {
                        if (window.OPUcLog) window.OPUcLog.error("Not logged in to OPU.");
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

        parseHTMLAndRender: function(htmlString) {
            const doc = new DOMParser().parseFromString(htmlString, 'text/html');
            const boxes = doc.querySelectorAll('.box a.swipebox, .boxtop a.swipebox'); 
            const grid = document.getElementById('opuc-gallery-grid');

            if (boxes.length === 0) {
                if (window.OPUcLog) window.OPUcLog.debug("Reached end of gallery history.");
                this.hasMore = false;
                return;
            }

            boxes.forEach(a => {
                const fullUrl = a.href;
                const imgNode = a.querySelector('img');
                const thumbUrl = imgNode ? imgNode.src : fullUrl;

                const wrapper = document.createElement('div');
                wrapper.className = 'opuc-gallery-item';
                wrapper.style.cssText = 'width: 100%; aspect-ratio: 1; border: 2px solid transparent; border-radius: 4px; overflow: hidden; cursor: pointer; transition: transform 0.1s; background: #000;';
                
                const img = document.createElement('img');
                img.loading = 'lazy'; 
                img.src = thumbUrl;
                img.style.cssText = 'width: 100%; height: 100%; object-fit: cover; opacity: 0.8; pointer-events: none;';

                wrapper.onclick = () => this.toggleSelection(wrapper, fullUrl, img);
                
                wrapper.appendChild(img);
                grid.appendChild(wrapper);
            });

            // Re-append the sentinel at the very bottom
            let sentinel = document.getElementById('opuc-gallery-sentinel');
            if (!sentinel) {
                sentinel = document.createElement('div');
                sentinel.id = 'opuc-gallery-sentinel';
                sentinel.style.cssText = 'grid-column: 1 / -1; height: 1px; width: 100%;';
                grid.appendChild(sentinel);
                if (this.observer) this.observer.observe(sentinel);
            } else {
                grid.appendChild(sentinel);
            }
        },

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

        insertSelected: function() {
            if (this.selectedImages.size === 0) return;
            if (window.OPUcAPI && window.OPUcAPI.injectIntoOkoun) {
                this.selectedImages.forEach(url => window.OPUcAPI.injectIntoOkoun(url));
            }
            this.close();
        }
    };
})();
