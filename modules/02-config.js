// modules/02-config.js
(function() {
    'use strict';

    window.OPUcRequest = function(details) {
        if (typeof GM_xmlhttpRequest !== 'undefined') return GM_xmlhttpRequest(details); 
        else if (typeof GM !== 'undefined' && GM.xmlHttpRequest) return GM.xmlHttpRequest(details); 
        else return null; 
    };

    window.OPUcConfig = {
        get: (key, defaultValue) => {
            if (typeof GM_getValue !== 'undefined') return GM_getValue(key, defaultValue);
            try {
                const val = localStorage.getItem('opuc_' + key);
                if (val !== null) return JSON.parse(val);
            } catch(e) {}
            return defaultValue;
        },
        set: (key, value) => {
            if (typeof GM_setValue !== 'undefined') GM_setValue(key, value);
            try { localStorage.setItem('opuc_' + key, JSON.stringify(value)); } catch(e) {}
        },

        settings: {
            get stagingEnabled() { return window.OPUcConfig.get('opuc_staging_enabled', true); },
            get uploadShortcut() { return window.OPUcConfig.get('opuc_upload_shortcut', 'Alt+V'); },
            // NEW: The Firefox Ctrl+V workaround toggle
            get interceptPasteUrls() { return window.OPUcConfig.get('opuc_intercept_paste_urls', false); }, 
            get interceptDrop() { return window.OPUcConfig.get('opuc_intercept_drop', true); },
            get primaryAction() { return window.OPUcConfig.get('opuc_primary_action', 'picker'); },
            get formatTag() { return window.OPUcConfig.get('opuc_format_tag', '<img src="%url%">'); }
        },

        state: { isLoggedIn: true },

        dom: {
            get form() { return document.getElementById('article-form-main'); },
            get textArea() { return document.getElementById('post-body'); },
            get toolsRow() { return document.querySelector('.post.content .tools'); },
            get formatSelect() { return document.querySelector('select[name="bodyType"]'); }
        },

        api: {
            upload: 'https://opu.peklo.biz/opupload.php',
            gallery: 'https://opu.peklo.biz/?page=userpanel'
        }
    };
})();
