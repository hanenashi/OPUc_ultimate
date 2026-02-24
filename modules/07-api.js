// modules/07-api.js
(function() {
    'use strict';

    window.OPUcAPI = {
        
        checkLoginStatus: function() {
            return new Promise((resolve) => {
                GM_xmlhttpRequest({
                    method: 'GET',
                    url: window.OPUcConfig.api.gallery,
                    onload: function(response) {
                        const isLoggedIn = !response.finalUrl.includes('page=prihlaseni');
                        if (window.OPUcLog) window.OPUcLog.debug(`Session check: ${isLoggedIn ? 'LOGGED IN' : 'LOGGED OUT (Anon Mode)'}`);
                        
                        // Save to global state
                        window.OPUcConfig.state.isLoggedIn = isLoggedIn;
                        resolve(isLoggedIn);
                    },
                    onerror: function() {
                        if (window.OPUcLog) window.OPUcLog.error("Failed to connect to OPU for session check. Defaulting to Anon Mode.");
                        window.OPUcConfig.state.isLoggedIn = false;
                        resolve(false);
                    }
                });
            });
        },

        upload: async function(file) {
            // Check state locally instead of firing a new network request
            const isLoggedIn = window.OPUcConfig.state.isLoggedIn;
            
            if (!isLoggedIn && window.OPUcLog) window.OPUcLog.warn("Executing Anon Upload.");

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
                            const finalLink = window.OPUcAPI.extractLinkFromResponse(response.responseText);
                            if (finalLink) {
                                window.OPUcAPI.injectIntoOkoun(finalLink);
                                resolve(finalLink);
                            } else {
                                reject("Extraction failed");
                            }
                        } else {
                            reject(`HTTP Error ${response.status}`);
                        }
                    },
                    onerror: function(err) {
                        reject(err);
                    }
                });
            });
        },

        extractLinkFromResponse: function(htmlString) {
            const doc = new DOMParser().parseFromString(htmlString, 'text/html');
            const linkInput = doc.querySelector('input[id^="link_"]'); 
            if (linkInput && linkInput.value) {
                const match = linkInput.value.match(/href="([^"]+)"/i);
                if (match && match[1]) return match[1];
                return linkInput.value;
            }
            return null;
        },

        injectIntoOkoun: function(imageUrl) {
            const textArea = window.OPUcConfig.dom.textArea;
            if (!textArea) return;

            const formatString = window.OPUcConfig.settings.formatTag;
            const formattedTag = formatString.replace(/%url%/g, imageUrl) + '\n';
            
            const startPos = textArea.selectionStart;
            const endPos = textArea.selectionEnd;
            
            if (startPos !== undefined && startPos !== null) {
                textArea.value = textArea.value.substring(0, startPos) + formattedTag + textArea.value.substring(endPos, textArea.value.length);
                textArea.selectionStart = textArea.selectionEnd = startPos + formattedTag.length;
            } else {
                textArea.value += formattedTag;
            }
            
            textArea.dispatchEvent(new Event('input', { bubbles: true }));
        }
    };
})();
