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
                        // If OPU redirects to login page, user is logged out
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
                if (window.OPUcLog) window.OPUcLog.error("Upload aborted: You are not logged into opu.peklo.biz!");
                alert("OPUc Error: Please log into opu.peklo.biz in another tab first.");
                return;
            }

            if (window.OPUcLog) window.OPUcLog.info(`Starting upload for: ${file.name || 'blob'}`);
            
            // Build the payload identical to OPU's native HTML form
            const formData = new FormData();
            formData.append('obrazek[0]', file);
            formData.append('sizep', '0');      // Do not resize on server
            formData.append('outputf', 'auto'); // Auto format
            formData.append('tl_odeslat', 'Odeslat'); // The submit button trigger

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
                                // TODO: Hook this to a visual progress bar over the Staging Ribbon thumbnail
                            }
                        }
                    },
                    onload: function(response) {
                        if (response.status === 200) {
                            if (window.OPUcLog) window.OPUcLog.info("Upload complete! Parsing response...");
                            
                            // OPU returns an HTML page containing the links. 
                            // We need to parse it to extract the final image URL.
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

        // 3. Response Parser
        extractLinkFromResponse: function(htmlString) {
            // Parses the returned HTML from opupload.php to find the generated URL
            const doc = new DOMParser().parseFromString(htmlString, 'text/html');
            
            // Look for OPU's native output inputs (e.g., id="link_0" or id="htmlcode_0")
            const linkInput = doc.querySelector('input[id^="link_"]'); 
            
            if (linkInput && linkInput.value) {
                if (window.OPUcLog) window.OPUcLog.debug(`Successfully extracted link: ${linkInput.value}`);
                return linkInput.value;
            }
            return null;
        },

        // 4. Okoun Formatter & Injector
        injectIntoOkoun: function(imageUrl) {
            const textArea = window.OPUcConfig.dom.textArea;
            if (!textArea) return;

            // TODO: Read Okoun's actual select[name="bodyType"] to determine HTML vs Radeox
            // Defaulting to simple HTML img tag for now
            const formattedTag = `<img src="${imageUrl}">\n`;
            
            // Insert at cursor position
            const startPos = textArea.selectionStart;
            const endPos = textArea.selectionEnd;
            
            if (startPos !== undefined && startPos !== null) {
                textArea.value = textArea.value.substring(0, startPos) + formattedTag + textArea.value.substring(endPos, textArea.value.length);
                // Move cursor to after the inserted tag
                textArea.selectionStart = textArea.selectionEnd = startPos + formattedTag.length;
            } else {
                textArea.value += formattedTag;
            }
            
            if (window.OPUcLog) window.OPUcLog.info("Successfully injected image tag into Okoun reply box.");
        }
    };
})();
