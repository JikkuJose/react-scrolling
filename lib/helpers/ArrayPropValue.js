'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
var getPropValueForScroller = exports.getPropValueForScroller = function getPropValueForScroller(scroller, id, prop) {
    if (typeof id === 'string') {
        if (id === scroller) {
            return prop;
        }
        return undefined;
    }
    var index = id.indexOf(scroller);
    if (index >= 0) {
        if (prop instanceof Array) {
            return prop[index];
        }
        return prop;
    }
    return undefined;
};