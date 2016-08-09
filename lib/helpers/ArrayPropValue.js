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

var propValuesSome = exports.propValuesSome = function propValuesSome(prop) {
  var condition = arguments.length <= 1 || arguments[1] === undefined ? function (x) {
    return x;
  } : arguments[1];

  if (prop instanceof Array) {
    return prop.some(condition);
  }
  return condition(prop);
};

var propValuesEvery = exports.propValuesEvery = function propValuesEvery(prop) {
  var condition = arguments.length <= 1 || arguments[1] === undefined ? function (x) {
    return x;
  } : arguments[1];

  if (prop instanceof Array) {
    return prop.every(condition);
  }
  return condition(prop);
};