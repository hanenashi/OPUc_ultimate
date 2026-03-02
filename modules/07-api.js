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

            // 1. Zjistit aktuálně vybraný formát pro dané okno
            const parentForm = textArea.closest('.post.content') || document.getElementById('article-form-main');
            let currentBodyType = 'html';
            if (parentForm) {
                const select = parentForm.querySelector('select[name="bodyType"]');
                if (select) currentBodyType = select.value;
            }

            // 2. Vyřešit finální Injekční tag
            let formatString = metadata.formatOverride || window.OPUcConfig.settings.formatTag;
            
            if (formatString === 'auto') {
                if (currentBodyType === 'html') formatString = '<img src="%url%">';
                else if (currentBodyType === 'radeox') formatString = '[img:%url%]';
                else if (currentBodyType === 'markdown') formatString = '![](%url%)';
                else if (currentBodyType === 'plain') formatString = '%url%';
                else formatString = '<img src="%url%">';
            }

            let formattedTag = formatString.replace(/%url%/g, imageUrl);

            // 3. Přidání popisku (Caption)
            if (metadata.caption) {
                // CHYTRÝ MARKDOWN: Pokud formát je Markdown, vložíme popisek rovnou do závorek!
                if (formatString === '![](%url%)' || formatString === '![image](%url%)') {
                    formattedTag = `![${metadata.caption}](${imageUrl})`;
                } else {
                    // Pro všechny ostatní formáty lepíme nad/pod
                    const pos = window.OPUcConfig.settings.captionPosition; 
                    const spc = window.OPUcConfig.settings.captionSpacing; 
                    
                    let sep = '\n'; // Default fallback
                    if (spc === 'br') sep = (currentBodyType === 'html') ? '<br>' : '\n';
                    else if (spc === 'br2') sep = (currentBodyType === 'html') ? '<br><br>' : '\n\n';
                    else if (spc === 'space') sep = ' ';

                    if (pos === 'above') {
                        formattedTag = metadata.caption + sep + formattedTag;
                    } else {
                        formattedTag = formattedTag + sep + metadata.caption;
                    }
                }
            }
            
            // Finální oddělovač za celým blokem obrázku (aby se obrázky neslily)
            formattedTag += (currentBodyType === 'html') ? '\n' : '\n\n';
            
            // 4. Samotná Injekce do okna
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