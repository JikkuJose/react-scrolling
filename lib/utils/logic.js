'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getSpringStyleForScroller = getSpringStyleForScroller;
exports.getPositionAndSpring = getPositionAndSpring;
exports.getEmptyVelocity = getEmptyVelocity;
exports.correctLoopPosition = correctLoopPosition;
exports.closestLoopPosition = closestLoopPosition;
exports.setOrientationPos = setOrientationPos;
exports.getCoordinatesByOrientation = getCoordinatesByOrientation;

var _reactMotion = require('react-motion');

var _OrientationHelpers = require('../helpers/OrientationHelpers');

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function getSpringStyleForScroller(scrollerState) {
  if (scrollerState.spring !== null) {
    return (0, _reactMotion.spring)(scrollerState.position, scrollerState.spring);
  }
  return scrollerState.position;
}

function getPositionAndSpring(newPosition, springValue) {
  return {
    position: newPosition,
    spring: springValue
  };
}

function getEmptyVelocity() {
  return {
    velocityX: 0,
    velocityY: 0
  };
}

function correctLoopPosition(position, contentSize, contentAutoSize) {
  var contentSize2 = contentAutoSize === undefined ? contentSize : contentAutoSize;
  var pos = position % contentSize2;
  if (pos > 0) {
    pos -= contentSize2;
  }
  return pos;
}

function closestLoopPosition(oldPosition, newPosition, contentSize, contentAutoSize) {
  var contentSize2 = contentAutoSize === undefined ? contentSize : contentAutoSize;
  var newPosition2 = correctLoopPosition(newPosition, contentSize, contentAutoSize);
  var oldFrame = Math.ceil(oldPosition / contentSize2);
  var prevFrame = (oldFrame - 1) * contentSize2 + newPosition2;
  var currFrame = oldFrame * contentSize2 + newPosition2;
  var nextFrame = (oldFrame + 1) * contentSize2 + newPosition2;
  var min = prevFrame;
  if (Math.abs(currFrame - oldPosition) < Math.abs(min - oldPosition)) {
    min = currFrame;
  }
  if (Math.abs(nextFrame - oldPosition) < Math.abs(min - oldPosition)) {
    min = nextFrame;
  }
  return min;
}

function setOrientationPos(translate, orientation, position) {
  return Object.assign({}, translate, _defineProperty({}, _OrientationHelpers.orientationProp[orientation], position));
}

function getCoordinatesByOrientation(coordinates, orientation) {
  return coordinates[_OrientationHelpers.orientationProp[orientation]];
}