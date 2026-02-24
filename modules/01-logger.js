// modules/01-logger.js
(function() {
    'use strict';

    const LOG_LEVELS = { OFF: 0, ERROR: 1, WARN: 2, INFO: 3, DEBUG: 4 };
    
    // MASTER SWITCH: Set to LOG_LEVELS.OFF for production
    const CURRENT_LOG_LEVEL = LOG_LEVELS.DEBUG; 

    const baseStyle = 'border-radius: 3px; padding: 2px 6px; font-weight: bold; color: #fff;';
    
    window.OPUcLog = {
        level: CURRENT_LOG_LEVEL,
        info: (msg, ...args) => { 
            if(CURRENT_LOG_LEVEL >= LOG_LEVELS.INFO) 
                console.log(`%c OPUc: INFO %c ${msg}`, `background: #2196F3; ${baseStyle}`, 'color: inherit;', ...args); 
        },
        warn: (msg, ...args) => { 
            if(CURRENT_LOG_LEVEL >= LOG_LEVELS.WARN) 
                console.warn(`%c OPUc: WARN %c ${msg}`, `background: #FF9800; ${baseStyle}`, 'color: inherit;', ...args); 
        },
        error: (msg, ...args) => { 
            if(CURRENT_LOG_LEVEL >= LOG_LEVELS.ERROR) 
                console.error(`%c OPUc: ERROR %c ${msg}`, `background: #F44336; ${baseStyle}`, 'color: inherit;', ...args); 
        },
        debug: (msg, ...args) => { 
            if(CURRENT_LOG_LEVEL >= LOG_LEVELS.DEBUG) 
                console.debug(`%c OPUc: DEBUG %c ${msg}`, `background: #9E9E9E; ${baseStyle}`, 'color: #777;', ...args); 
        }
    };
})();
