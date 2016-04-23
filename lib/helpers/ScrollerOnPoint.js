'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.scrollerOnPoint = undefined;

var _OrientationHelpers = require('./OrientationHelpers');

var scrollerOnPoint = exports.scrollerOnPoint = function scrollerOnPoint(point, _ref) {
  var id = _ref.id;
  var multiple = _ref.multiple;
  var orientation = _ref.orientation;

  if (typeof id === 'string') {
    return id;
  }
  var reverseOrientation = (orientation + 1) % 2;
  var reverseValue = point[_OrientationHelpers.orientationProp[reverseOrientation]];
  var index = Math.floor((reverseValue - multiple.before) / (multiple.size + multiple.between));
  var delta = (reverseValue - multiple.before) % (multiple.size + multiple.between);
  if (delta > multiple.size) {
    return undefined;
  }
  return id[index];
};