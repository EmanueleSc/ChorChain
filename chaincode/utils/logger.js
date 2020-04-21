'use strict';

let logger = {}
logger.debugLevel = 'error';
logger.log = function(level, message) {
    let levels = ['info', 'warn', 'error'];
    if (levels.indexOf(level) <= levels.indexOf(logger.debugLevel) ) {
        if (typeof message !== 'string') {
            message = JSON.stringify(message);
        }
        console.log(level+': '+message);
    }
}

module.exports = {
    logger
}
