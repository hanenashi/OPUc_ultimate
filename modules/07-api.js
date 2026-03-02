// modules/07-api.js
(function() {
    'use strict';

    window.OPUcAPI = {
        checkLoginStatus: function() {
            return new Promise((resolve) => {
                window.OPUcRequest({
                    method: 'GET', url: window.OPUcConfig.api.gallery,
                    onload: function(response) {
                        const isLoggedIn = !response.finalUrl.includes('page=prihlaseni');
                        window.OPUcConfig.state.isLoggedIn = isLoggedIn;
                        resolve(isLoggedIn);
                    },
                    onerror: function() {
                        window.OPUcConfig.state.isLoggedIn = false;
                        resolve(false);
                    }
                });
            });
        },

        upload: async function(file, metadata = {}) {
            const formData = new FormData();
            formData.append('obrazek[0]', file);
            formData.append('sizep', '0');      
            formData.append('outputf', 'auto'); 
            formData.append('tl_odeslat', 'Odeslat'); 

            return new Promise((resolve, reject) => {
                window.OPUcRequest({
                    method: 'POST', url: window.OPUcConfig.api.upload, data: formData,
                    onload: function(response) {
                        if (response.status === 200) {
                            const finalLink = window.OPUcAPI.extractLinkFromResponse(response.responseText);
                            if (finalLink) {
                                window.OPUcAPI.injectIntoOkoun(finalLink, metadata);
                                resolve(finalLink);
                            } else reject("Extraction failed");
                        } else reject(`HTTP Error ${response.status}`);
                    },
                    onerror: function(err) { reject(err); }
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

        injectIntoOkoun: function(imageUrl, metadata = {}) {
            let textArea = window.OPUcConfig.state.activeTextArea;
            if (!textArea) {
                textArea = document.getElementById('post-body'); 
                if(!textArea) return;
            }

            // Generate Base Tag (Use Override or Global Default)
            let formatString = metadata.formatOverride || window.OPUcConfig.settings.formatTag;
            let formattedTag = formatString.replace(/%url%/g, imageUrl);

            // Stitch Caption if it exists
            if (metadata.caption) {
                const pos = window.OPUcConfig.settings.captionPosition; 
                const spc = window.OPUcConfig.settings.captionSpacing; 
                
                let sep = '\n';
                if (spc === 'br') sep = '<br>';
                else if (spc === 'br2') sep = '<br><br>';
                else if (spc === 'space') sep = ' ';

                if (pos === 'above') {
                    formattedTag = metadata.caption + sep + formattedTag;
                } else {
                    formattedTag = formattedTag + sep + metadata.caption;
                }
            }
            
            formattedTag += '\n'; // Add trailing break to separate multiple uploads
            
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