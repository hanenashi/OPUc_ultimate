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
            try { const val = localStorage.getItem('opuc_' + key); if (val !== null) return JSON.parse(val); } catch(e) {}
            return defaultValue;
        },
        set: (key, value) => {
            if (typeof GM_setValue !== 'undefined') GM_setValue(key, value);
            try { localStorage.setItem('opuc_' + key, JSON.stringify(value)); } catch(e) {}
        },

        settings: {
            get stagingEnabled() { return window.OPUcConfig.get('opuc_staging_enabled', true); },
            get uploadShortcut() { return window.OPUcConfig.get('opuc_upload_shortcut', 'Alt+V'); },
            get interceptPasteUrls() { return window.OPUcConfig.get('opuc_intercept_paste_urls', false); }, 
            get interceptDrop() { return window.OPUcConfig.get('opuc_intercept_drop', true); },
            get primaryAction() { return window.OPUcConfig.get('opuc_primary_action', 'picker'); },
            get theme() { return window.OPUcConfig.get('opuc_theme', 'classic'); },
            get uiScale() { return window.OPUcConfig.get('opuc_ui_scale', '1.0'); },
            get galleryThumbSize() { return window.OPUcConfig.get('opuc_gallery_thumb_size', '100px'); },
            
            get autoResize() { return window.OPUcConfig.get('opuc_auto_resize', '100%'); }, 
            
            get format() { return window.OPUcConfig.get('opuc_format', 'auto'); },
            get style() { return window.OPUcConfig.get('opuc_style', 'image'); },
            
            get imageWidth() { return window.OPUcConfig.get('opuc_image_width', ''); },
            get captionPosition() { return window.OPUcConfig.get('opuc_caption_position', 'below'); },
            get captionSpacing() { return window.OPUcConfig.get('opuc_caption_spacing', 'double'); },
            get betweenSpacing() { return window.OPUcConfig.get('opuc_between_spacing', 'double'); },

            // NEW: The Mad Fixer Button Override
            get nskalButton() { return window.OPUcConfig.get('opuc_nskal_button', false); }
        },

        state: { isLoggedIn: true, activeTextArea: null },

        api: {
            upload: 'https://opu.peklo.biz/opupload.php',
            gallery: 'https://opu.peklo.biz/?page=userpanel'
        }
    };
})();