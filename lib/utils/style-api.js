'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getContainerWithOrientationStyle = getContainerWithOrientationStyle;

var _style = require('./style');

var _OrientationHelpers = require('../helpers/OrientationHelpers');

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function getContainerWithOrientationStyle(orientation, size) {
  return Object.assign({}, _style.CONTAINER_STYLE, _defineProperty({}, _OrientationHelpers.orientationSize[orientation], size.container + 'px'));
}