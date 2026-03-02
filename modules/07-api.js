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
                    onerror: function() { window.OPUcConfig.state.isLoggedIn = false; resolve(false); }
                });
            });
        },

        upload: async function(file, metadata = {}, isLastItem = true) {
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
                                try {
                                    window.OPUcAPI.injectIntoOkoun(finalLink, metadata, isLastItem);
                                    resolve(finalLink);
                                } catch (e) {
                                    console.error("OPUc Injection Math Error:", e);
                                    reject(e);
                                }
                            } else {
                                console.error("OPUc Extraction Error: Could not parse link from OPU HTML.");
                                reject("Extraction failed");
                            }
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

        buildTag: function(imageUrl, metadata = {}, currentBodyType, isLastItem) {
            let format = window.OPUcConfig.settings.format;
            if (format === 'auto') format = currentBodyType;

            let style = metadata.styleOverride || window.OPUcConfig.settings.style;
            let formatString = '%url%'; 

            if (format === 'html') {
                if (style === 'image') formatString = '<img src="%url%">';
                else if (style === 'link') formatString = '<a href="%url%">%url%</a>';
                else if (style === 'thumb') formatString = '<a href="%url%"><img src="%thumb%"></a>';
            } else if (format === 'markdown') {
                if (style === 'image') formatString = '![](%url%)';
                else if (style === 'link') formatString = '[%url%](%url%)';
                else if (style === 'thumb') formatString = '[![thumb](%thumb%)](%url%)';
            } else if (format === 'radeox') {
                if (style === 'image') formatString = '[img:%url%]';
                else if (style === 'link') formatString = '[url=%url%]'; 
                else if (style === 'thumb') formatString = '[url=%url%][img:%thumb%][/url]';
            }

            let thumbUrl = imageUrl.replace('/p/', '/t/');
            let formattedTag = formatString.replace(/%url%/g, imageUrl).replace(/%thumb%/g, thumbUrl);

            const isHtmlFormat = (format === 'html');
            
            // NEW: Semantic Spacing Engine
            const getSpacing = (semanticType) => {
                // Legacy fallbacks for older saves
                if (semanticType === 'br' || semanticType === 'nl') semanticType = 'single';
                if (semanticType === 'br2' || semanticType === 'nl2' || semanticType === 'auto') semanticType = 'double';
                
                if (semanticType === 'single') return isHtmlFormat ? '<br>\n' : '\n';
                if (semanticType === 'double') return isHtmlFormat ? '<br><br>\n' : '\n\n';
                if (semanticType === 'space') return ' ';
                if (semanticType === 'none') return isHtmlFormat ? '\n' : ''; // \n in HTML source won't break layout
                return isHtmlFormat ? '<br><br>\n' : '\n\n';
            };

            // Stitch Caption
            if (metadata.caption) {
                const pos = window.OPUcConfig.settings.captionPosition; 
                const spc = window.OPUcConfig.settings.captionSpacing; 
                let sep = getSpacing(spc);

                if (pos === 'above') formattedTag = metadata.caption + sep + formattedTag;
                else formattedTag = formattedTag + sep + metadata.caption;
            }
            
            // Append spacing between multiple uploads
            if (!isLastItem) {
                const betSpc = window.OPUcConfig.settings.betweenSpacing;
                formattedTag += getSpacing(betSpc);
            } else {
                formattedTag += '\n'; 
            }
            
            return formattedTag;
        },

        injectIntoOkoun: function(imageUrl, metadata = {}, isLastItem = true) {
            let textArea = window.OPUcConfig.state.activeTextArea;
            if (!textArea) {
                textArea = document.getElementById('post-body'); 
                if(!textArea) return;
            }

            const parentForm = textArea.closest('.post.content') || document.getElementById('article-form-main');
            let currentBodyType = 'html';
            if (parentForm) {
                const select = parentForm.querySelector('select[name="bodyType"]');
                if (select) currentBodyType = select.value;
            }

            const formattedTag = this.buildTag(imageUrl, metadata, currentBodyType, isLastItem);
            
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