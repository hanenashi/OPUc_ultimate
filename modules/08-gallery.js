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
            let modal = document.getElementById('opuc-gallery-modal');
            
            if (!modal) {
                modal = document.createElement('div');
                modal.id = 'opuc-gallery-modal';
                modal.style.cssText = `
                    position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
                    background: rgba(0,0,0,0.6); z-index: var(--opuc-z-index-overlay, 2147483647);
                    display: flex; flex-direction: column; align-items: center; justify-content: center;
                    backdrop-filter: blur(5px);
                `;

                const container = document.createElement('div');
                container.style.cssText = `
                    width: 90%; max-width: 1000px; height: 85%; background: var(--opuc-bg-secondary);
                    border-radius: 8px; border: 1px solid var(--opuc-border);
                    display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                `;

                const header = document.createElement('div');
                header.style.cssText = 'padding: 15px; background: rgba(0,0,0,0.05); border-bottom: 1px solid var(--opuc-border); display: flex; justify-content: space-between; align-items: center;';
                header.innerHTML = '<b style="color: var(--opuc-text-main); font-size: 18px;">🖼️ OPUc Gallery</b>';
                
                const closeBtn = document.createElement('button');
                closeBtn.innerHTML = '✖';
                closeBtn.style.cssText = 'background: none; border: none; color: var(--opuc-text-main); font-size: 20px; cursor: pointer;';
                closeBtn.onclick = () => this.close();
                header.appendChild(closeBtn);

                const grid = document.createElement('div');
                grid.id = 'opuc-gallery-grid';
                grid.style.cssText = 'flex: 1; overflow-y: auto; padding: 15px; display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; align-content: flex-start;';
                
                this.observer = new IntersectionObserver((entries) => {
                    if (entries[0].isIntersecting && !this.isLoading && this.hasMore) {
                        this.fetchPage(this.currentPage + 1);
                    }
                }, { root: grid, rootMargin: '300px' });

                const footer = document.createElement('div');
                footer.style.cssText = 'padding: 15px; background: rgba(0,0,0,0.05); border-top: 1px solid var(--opuc-border); display: flex; justify-content: space-between; align-items: center;';
                
                const statusText = document.createElement('span');
                statusText.id = 'opuc-gallery-status';
                statusText.style.cssText = 'color: var(--opuc-text-muted); font-size: 14px;';
                statusText.innerText = '0 selected';

                const insertBtn = document.createElement('button');
                insertBtn.innerText = 'Insert Selected';
                insertBtn.style.cssText = 'background: var(--opuc-accent); color: #fff; font-weight: bold; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;';
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

            window.OPUcRequest({
                method: 'GET',
                url: `${window.OPUcConfig.api.gallery}&recordStart=${pageNum}`,
                onload: (response) => {
                    if (response.finalUrl && response.finalUrl.includes('page=prihlaseni')) {
                        this.isLoading = false;
                        this.close();
                        return;
                    }
                    this.isLoading = false; 
                    this.parseHTMLAndRender(response.responseText);
                },
                onerror: () => { this.isLoading = false; }
            });
        },

        parseHTMLAndRender: function(htmlString) {
            const doc = new DOMParser().parseFromString(htmlString, 'text/html');
            const boxes = doc.querySelectorAll('.box a.swipebox, .boxtop a.swipebox'); 
            const grid = document.getElementById('opuc-gallery-grid');

            if (boxes.length === 0) {
                this.hasMore = false;
                return;
            }

            boxes.forEach(a => {
                const fullUrl = a.href;
                const imgNode = a.querySelector('img');
                const thumbUrl = imgNode ? imgNode.src : fullUrl;

                const wrapper = document.createElement('div');
                wrapper.className = 'opuc-gallery-item';
                wrapper.style.cssText = 'width: 100px; height: 100px; flex-shrink: 0; border: 2px solid transparent; border-radius: 4px; overflow: hidden; cursor: pointer; transition: transform 0.1s; background: var(--opuc-bg-primary);';
                
                const img = document.createElement('img');
                img.loading = 'lazy'; 
                img.src = thumbUrl;
                img.style.cssText = 'width: 100%; height: 100%; object-fit: cover; opacity: 0.8; pointer-events: none;';

                wrapper.onclick = () => this.toggleSelection(wrapper, fullUrl, img);
                wrapper.appendChild(img);
                grid.appendChild(wrapper);
            });

            let oldSentinel = document.getElementById('opuc-gallery-sentinel');
            if (oldSentinel) {
                if (this.observer) this.observer.unobserve(oldSentinel);
                oldSentinel.remove();
            }
            
            const newSentinel = document.createElement('div');
            newSentinel.id = 'opuc-gallery-sentinel';
            newSentinel.style.cssText = 'flex-basis: 100%; height: 10px; pointer-events: none;';
            grid.appendChild(newSentinel);
            if (this.observer) this.observer.observe(newSentinel);
        },

        toggleSelection: function(wrapper, url, img) {
            if (this.selectedImages.has(url)) {
                this.selectedImages.delete(url);
                wrapper.style.border = '2px solid transparent';
                wrapper.style.transform = 'scale(1)';
                img.style.opacity = '0.8';
            } else {
                this.selectedImages.add(url);
                wrapper.style.border = '2px solid var(--opuc-accent)';
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
