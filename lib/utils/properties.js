'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getVelocityProp = getVelocityProp;
exports.getDeltaProp = getDeltaProp;
exports.getTranslate3D = getTranslate3D;

var _OrientationHelpers = require('../helpers/OrientationHelpers');

function getVelocityProp(orientation) {
  return 'velocity' + _OrientationHelpers.orientationProp[orientation].toUpperCase();
}

function getDeltaProp(orientation) {
  return 'delta' + _OrientationHelpers.orientationProp[orientation].toUpperCase();
}

function getTranslate3D(translate) {
  return 'translate3d(' + translate.x + 'px, ' + translate.y + 'px, 0px)';
}