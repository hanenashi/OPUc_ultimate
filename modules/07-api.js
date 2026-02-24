// modules/07-api.js
(function() {
    'use strict';

    window.OPUcAPI = {
        
        // 1. Silent Session Check
        checkLoginStatus: function() {
            return new Promise((resolve) => {
                GM_xmlhttpRequest({
                    method: 'GET',
                    url: window.OPUcConfig.api.gallery,
                    onload: function(response) {
                        const isLoggedIn = !response.finalUrl.includes('page=prihlaseni');
                        if (window.OPUcLog) window.OPUcLog.debug(`Session check: ${isLoggedIn ? 'LOGGED IN' : 'LOGGED OUT'}`);
                        resolve(isLoggedIn);
                    },
                    onerror: function() {
                        if (window.OPUcLog) window.OPUcLog.error("Failed to connect to OPU for session check.");
                        resolve(false);
                    }
                });
            });
        },

        // 2. The Upload Core
        upload: async function(file) {
            const isLoggedIn = await this.checkLoginStatus();
            
            if (!isLoggedIn) {
                // Silently log instead of shouting with an alert
                if (window.OPUcLog) window.OPUcLog.warn("Upload attempting while apparently logged out of OPU.");
            }

            if (window.OPUcLog) window.OPUcLog.info(`Starting upload for: ${file.name || 'blob'}`);
            
            const formData = new FormData();
            formData.append('obrazek[0]', file);
            formData.append('sizep', '0');      
            formData.append('outputf', 'auto'); 
            formData.append('tl_odeslat', 'Odeslat'); 

            return new Promise((resolve, reject) => {
                GM_xmlhttpRequest({
                    method: 'POST',
                    url: window.OPUcConfig.api.upload,
                    data: formData,
                    upload: {
                        onprogress: function(e) {
                            if (e.lengthComputable) {
                                const percent = Math.round((e.loaded / e.total) * 100);
                                if (window.OPUcLog) window.OPUcLog.debug(`Upload progress: ${percent}%`);
                            }
                        }
                    },
                    onload: function(response) {
                        if (response.status === 200) {
                            if (window.OPUcLog) window.OPUcLog.info("Upload complete! Parsing response...");
                            
                            const finalLink = window.OPUcAPI.extractLinkFromResponse(response.responseText);
                            
                            if (finalLink) {
                                window.OPUcAPI.injectIntoOkoun(finalLink);
                                resolve(finalLink);
                            } else {
                                if (window.OPUcLog) window.OPUcLog.error("Failed to extract image link from OPU response.");
                                reject("Extraction failed");
                            }
                        } else {
                            if (window.OPUcLog) window.OPUcLog.error(`Upload failed. Server returned status: ${response.status}`);
                            reject(`HTTP Error ${response.status}`);
                        }
                    },
                    onerror: function(err) {
                        if (window.OPUcLog) window.OPUcLog.error("Network error during upload.", err);
                        reject(err);
                    }
                });
            });
        },

        // 3. Response Parser (FIXED)
        extractLinkFromResponse: function(htmlString) {
            const doc = new DOMParser().parseFromString(htmlString, 'text/html');
            const linkInput = doc.querySelector('input[id^="link_"]'); 
            
            if (linkInput && linkInput.value) {
                // OPU returns: <a href="https://opu.peklo.biz/p/...">name.jpg</a>
                // We use Regex to extract just the raw URL inside the href=""
                const match = linkInput.value.match(/href="([^"]+)"/i);
                
                if (match && match[1]) {
                    const rawUrl = match[1];
                    if (window.OPUcLog) window.OPUcLog.debug(`Successfully extracted raw link: ${rawUrl}`);
                    return rawUrl;
                }
                
                // Fallback just in case OPU changes their output format later
                return linkInput.value;
            }
            return null;
        },

        // 4. Okoun Formatter & Injector
        injectIntoOkoun: function(imageUrl) {
            const textArea = window.OPUcConfig.dom.textArea;
            if (!textArea) return;

            const formattedTag = `<img src="${imageUrl}">\n`;
            
            const startPos = textArea.selectionStart;
            const endPos = textArea.selectionEnd;
            
            if (startPos !== undefined && startPos !== null) {
                textArea.value = textArea.value.substring(0, startPos) + formattedTag + textArea.value.substring(endPos, textArea.value.length);
                textArea.selectionStart = textArea.selectionEnd = startPos + formattedTag.length;
            } else {
                textArea.value += formattedTag;
            }
            
            if (window.OPUcLog) window.OPUcLog.info("Successfully injected image tag into Okoun reply box.");
            
            // Trigger Okoun's input event so any native board scripts know the text changed
            textArea.dispatchEvent(new Event('input', { bubbles: true }));
        }
    };
})();
