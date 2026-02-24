// modules/09-init.js
(function() {
    'use strict';

    const bootOPUc = () => {
        if (window.OPUcLog) window.OPUcLog.info("=== OPUc Ultimate Boot Sequence Started ===");

        // 1. Inject Styles
        if (window.OPUcTheme) window.OPUcTheme.inject();

        // 2. Build UI
        if (window.OPUcUI) window.OPUcUI.inject();

        // 3. Arm Interceptors
        if (window.OPUcInterceptors) window.OPUcInterceptors.init();

        if (window.OPUcLog) window.OPUcLog.info("=== OPUc Ultimate Boot Sequence Complete ===");
    };

    // Run when DOM is safe
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bootOPUc);
    } else {
        bootOPUc();
    }
})();
