// modules/03-theme.js
(function() {
    'use strict';

    window.OPUcTheme = {
        inject: function() {
            if (window.OPUcLog) window.OPUcLog.debug("Booting Theme Engine...");

            // Create a native style element to bypass Greasemonkey/Firefox restrictions
            const style = document.createElement('style');
            style.id = 'opuc-theme-styles';
            style.innerHTML = `
                /* --- CSS VARIABLES --- */
                :root {
                    --opuc-bg-primary: #2b2b2b;
                    --opuc-bg-secondary: #1a1a1a;
                    --opuc-text-main: #ffffff;
                    --opuc-text-muted: #aaaaaa;
                    --opuc-accent: #FF9800;
                    --opuc-accent-hover: #e68a00;
                    --opuc-border: #444444;
                    --opuc-danger: #F44336;
                    --opuc-success: #4CAF50;
                    --opuc-radius: 4px;
                    --opuc-z-index-overlay: 2147483647;
                }

                /* --- BASE CSS --- */
                #opuc-staging-area {
                    display: none; 
                    width: 100%;
                    min-height: 80px;
                    background: var(--opuc-bg-primary);
                    border: 2px dashed var(--opuc-border);
                    margin-bottom: 10px;
                    border-radius: var(--opuc-radius);
                    padding: 10px;
                    box-sizing: border-box;
                    color: var(--opuc-text-main);
                }

                #opuc-staging-area.active {
                    display: flex;
                    gap: 10px;
                    flex-wrap: wrap;
                    align-items: center;
                }

                .opuc-drag-active {
                    border: 2px dashed var(--opuc-accent) !important;
                    background-color: rgba(255, 152, 0, 0.1) !important;
                }
            `;
            
            document.head.appendChild(style);

            if (window.OPUcLog) window.OPUcLog.info("Theme styles injected natively (Firefox safe).");
        }
    };
})();
