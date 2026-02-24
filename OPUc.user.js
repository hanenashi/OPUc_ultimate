// ==UserScript==
// @name         OPUc - Ultimate Okoun x OPU Integration
// @namespace    https://github.com/hanenashi/OPUc_ultimate
// @version      0.1.0
// @description  Brings opu.peklo.biz directly into okoun.cz via smart overlays and interceptors.
// @author       kokochan / hanenashi
// @match        *://www.okoun.cz/boards/*
// @match        *://www.okoun.cz/markArticles.do*
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_addStyle
// @grant        GM_getResourceText
// @connect      opu.peklo.biz

// --- CSS RESOURCES ---
// @resource     OPUcBaseCSS https://raw.githubusercontent.com/hanenashi/OPUc_ultimate/main/css/base.css
// @resource     OPUcThemeVanilla https://raw.githubusercontent.com/hanenashi/OPUc_ultimate/main/css/theme-vanilla.css

// --- MODULE IMPORTS ---
// @require      https://raw.githubusercontent.com/hanenashi/OPUc_ultimate/main/modules/01-logger.js
// @require      https://raw.githubusercontent.com/hanenashi/OPUc_ultimate/main/modules/02-config.js
// @require      https://raw.githubusercontent.com/hanenashi/OPUc_ultimate/main/modules/03-theme.js
// @require      https://raw.githubusercontent.com/hanenashi/OPUc_ultimate/main/modules/04-ui-core.js
// @require      https://raw.githubusercontent.com/hanenashi/OPUc_ultimate/main/modules/05-interceptors.js
// @require      https://raw.githubusercontent.com/hanenashi/OPUc_ultimate/main/modules/06-editor.js
// @require      https://raw.githubusercontent.com/hanenashi/OPUc_ultimate/main/modules/07-api.js
// @require      https://raw.githubusercontent.com/hanenashi/OPUc_ultimate/main/modules/08-gallery.js
// @require      https://raw.githubusercontent.com/hanenashi/OPUc_ultimate/main/modules/09-init.js
// ==/UserScript==

// The script logic is entirely handled by the imported modules.
// When Tampermonkey runs this, it executes the @require files in order.
