// modules/03-theme.js
(function() {
    'use strict';

    window.OPUcTheme = {
        inject: function() {
            const style = document.createElement('style');
            style.id = 'opuc-theme-styles';
            style.innerHTML = `
                /* --- CSS VARIABLES (Okoun Native Light Theme) --- */
                :root {
                    --opuc-bg-primary: #f0f0f0;
                    --opuc-bg-secondary: #ffffff;
                    --opuc-text-main: #333333;
                    --opuc-text-muted: #777777;
                    --opuc-accent: #FF9800;
                    --opuc-accent-hover: #F57C00;
                    --opuc-border: #cccccc;
                    --opuc-danger: #F44336;
                    --opuc-success: #4CAF50;
                    --opuc-radius: 4px;
                    --opuc-z-index-overlay: 2147483647;
                }

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
        }
    };
})();
