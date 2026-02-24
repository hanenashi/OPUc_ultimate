// modules/09-init.js
(function() {
    'use strict';

    const bootOPUc = async () => {
        if (window.OPUcLog) window.OPUcLog.info("=== OPUc Ultimate Boot Sequence Started ===");

        // 1. Inject Styles
        if (window.OPUcTheme) window.OPUcTheme.inject();

        // 2. Perform Login Check (Pauses boot until OPU responds)
        if (window.OPUcAPI) await window.OPUcAPI.checkLoginStatus();

        // 3. Build UI (Now aware of login status)
        if (window.OPUcUI) window.OPUcUI.inject();

        // 4. Arm Interceptors
        if (window.OPUcInterceptors) window.OPUcInterceptors.init();

        if (window.OPUcLog) window.OPUcLog.info("=== OPUc Ultimate Boot Sequence Complete ===");
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bootOPUc);
    } else {
        bootOPUc();
    }
})();
