// modules/02-config.js
(function() {
    'use strict';

    window.OPUcConfig = {
        get: (key, defaultValue) => GM_getValue(key, defaultValue),
        set: (key, value) => GM_setValue(key, value),

        settings: {
            get stagingEnabled() { return window.OPUcConfig.get('opuc_staging_enabled', true); },
            get uploadShortcut() { return window.OPUcConfig.get('opuc_upload_shortcut', 'Alt+V'); },
            get interceptDrop() { return window.OPUcConfig.get('opuc_intercept_drop', true); },
            get primaryAction() { return window.OPUcConfig.get('opuc_primary_action', 'picker'); },
            get formatTag() { return window.OPUcConfig.get('opuc_format_tag', '<img src="%url%">'); }
        },

        state: {
            isLoggedIn: true
        },

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
