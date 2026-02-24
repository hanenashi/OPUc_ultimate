// modules/03-theme.js
(function() {
    'use strict';

    window.OPUcTheme = {
        inject: function() {
            if (window.OPUcLog) window.OPUcLog.debug("Booting Theme Engine...");

            // 1. Inject the Variables (Vanilla Theme)
            const themeCSS = GM_getResourceText("OPUcThemeVanilla");
            if (themeCSS) {
                GM_addStyle(themeCSS);
                if (window.OPUcLog) window.OPUcLog.info("Theme variables injected.");
            } else {
                if (window.OPUcLog) window.OPUcLog.error("Failed to load OPUcThemeVanilla resource.");
            }

            // 2. Inject the Structural Rules
            const baseCSS = GM_getResourceText("OPUcBaseCSS");
            if (baseCSS) {
                GM_addStyle(baseCSS);
                if (window.OPUcLog) window.OPUcLog.info("Base layout CSS injected.");
            } else {
                if (window.OPUcLog) window.OPUcLog.error("Failed to load OPUcBaseCSS resource.");
            }
        }
    };
})();
