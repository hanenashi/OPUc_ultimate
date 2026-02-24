// ==UserScript==
// @name         OPUc - Ultimate Okoun x OPU Integration
// @namespace    https://github.com/hanenashi/OPUc_ultimate
// @version      0.1.21
// @description  Brings opu.peklo.biz directly into okoun.cz via smart overlays and interceptors.
// @author       kokochan / hanenashi
// @match        *://www.okoun.cz/boards/*
// @match        *://www.okoun.cz/markArticles.do*
// @match        *://www.okoun.cz/postArticle.do*
// @match        *://www.okoun.cz/editArticle.do*
// @grant        GM_xmlhttpRequest
// @grant        GM.xmlHttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @connect      opu.peklo.biz
// @connect      *

// --- MODULE IMPORTS ---
// @require      https://raw.githubusercontent.com/hanenashi/OPUc_ultimate/main/modules/01-logger.js?v=0.1.21
// @require      https://raw.githubusercontent.com/hanenashi/OPUc_ultimate/main/modules/02-config.js?v=0.1.21
// @require      https://raw.githubusercontent.com/hanenashi/OPUc_ultimate/main/modules/03-theme.js?v=0.1.21
// @require      https://raw.githubusercontent.com/hanenashi/OPUc_ultimate/main/modules/04-ui-core.js?v=0.1.21
// @require      https://raw.githubusercontent.com/hanenashi/OPUc_ultimate/main/modules/05-interceptors.js?v=0.1.21
// @require      https://raw.githubusercontent.com/hanenashi/OPUc_ultimate/main/modules/06-editor.js?v=0.1.21
// @require      https://raw.githubusercontent.com/hanenashi/OPUc_ultimate/main/modules/07-api.js?v=0.1.21
// @require      https://raw.githubusercontent.com/hanenashi/OPUc_ultimate/main/modules/08-gallery.js?v=0.1.21
// @require      https://raw.githubusercontent.com/hanenashi/OPUc_ultimate/main/modules/09-init.js?v=0.1.21
// @require      https://raw.githubusercontent.com/hanenashi/OPUc_ultimate/main/modules/10-settings.js?v=0.1.21
// ==/UserScript==
