// modules/03-theme.js
(function() {
    'use strict';

    window.OPUcTheme = {
        themes: {
            classic: `--opuc-bg-primary:#f0f0f0; --opuc-bg-secondary:#ffffff; --opuc-text-main:#333333; --opuc-text-muted:#777777; --opuc-accent:#FF9800; --opuc-accent-hover:#F57C00; --opuc-border:#cccccc; --opuc-danger:#F44336; --opuc-font:system-ui, -apple-system, sans-serif;`,
            dark: `--opuc-bg-primary:#2b2b2b; --opuc-bg-secondary:#1a1a1a; --opuc-text-main:#ffffff; --opuc-text-muted:#aaaaaa; --opuc-accent:#FF9800; --opuc-accent-hover:#e68a00; --opuc-border:#444444; --opuc-danger:#F44336; --opuc-font:system-ui, -apple-system, sans-serif;`,
            contrast: `--opuc-bg-primary:#000000; --opuc-bg-secondary:#000000; --opuc-text-main:#FFFF00; --opuc-text-muted:#FFFFFF; --opuc-accent:#00FF00; --opuc-accent-hover:#00CC00; --opuc-border:#FFFF00; --opuc-danger:#FF0000; --opuc-font:Tahoma, sans-serif;`,
            retro: `--opuc-bg-primary:#0000AA; --opuc-bg-secondary:#000000; --opuc-text-main:#FFFFFF; --opuc-text-muted:#AAAAAA; --opuc-accent:#FF55FF; --opuc-accent-hover:#FF5555; --opuc-border:#55FFFF; --opuc-danger:#FF5555; --opuc-font:"Courier New", monospace;`
        },

        inject: function() {
            const currentTheme = window.OPUcConfig.settings.theme;
            const scale = window.OPUcConfig.settings.uiScale;
            const thumbSize = window.OPUcConfig.settings.galleryThumbSize;
            const themeCSS = this.themes[currentTheme] || this.themes.classic;

            let style = document.getElementById('opuc-theme-styles');
            if (!style) {
                style = document.createElement('style');
                style.id = 'opuc-theme-styles';
                document.head.appendChild(style);
            }

            style.innerHTML = `
                :root {
                    ${themeCSS}
                    --opuc-success: #4CAF50; --opuc-radius: 4px; --opuc-z-index-overlay: 2147483647;
                    --opuc-scale: ${scale}; --opuc-thumb-size: ${thumbSize};
                }

                .opuc-staging-area {
                    display: none; width: 100%; min-height: 80px; background: var(--opuc-bg-primary);
                    border: 1px solid var(--opuc-text-main); margin: 15px 0 12px 0; border-radius: var(--opuc-radius);
                    padding: 10px; box-sizing: border-box; color: var(--opuc-text-main); font-family: var(--opuc-font);
                }
                .opuc-staging-area.active { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }

                .opuc-stage-tile { transition: opacity 0.2s ease; overflow: hidden; }
                .opuc-drag-left { box-shadow: inset 6px 0 0 0 var(--opuc-accent) !important; }
                .opuc-drag-right { box-shadow: inset -6px 0 0 0 var(--opuc-accent) !important; }

                .opuc-drag-active { border: 2px dashed var(--opuc-accent) !important; background-color: rgba(255, 152, 0, 0.1) !important; }
                .opuc-scalable { transform: scale(var(--opuc-scale)); }
                .opuc-origin-tr { transform-origin: top right !important; }

                /* NEW: NSKAL Button Styles */
                .opuc-nskal-btn {
                    background: transparent; border: none; padding: 0; margin-left: 8px; cursor: pointer;
                    display: inline-flex; align-items: center; justify-content: center; outline: none;
                    border-radius: 6px; transition: transform 0.1s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .opuc-nskal-btn:active {
                    transform: scale(0.85); /* The Squish */
                }
                .opuc-nskal-img {
                    width: 30px; height: 30px; border-radius: 6px; pointer-events: none; display: block;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.4); border: 1px solid var(--opuc-border);
                }
            `;
        },

        refresh: function() { this.inject(); }
    };
})();