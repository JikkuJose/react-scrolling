"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var eventCoordinates = exports.eventCoordinates = function eventCoordinates(e, scale) {
  var shift = window.innerWidth / 2 * (1 - scale);

  if (e.touches && e.touches.length > 0) {
    var firstTouch = e.touches[0];
    return {
      x: (firstTouch.clientX - shift) / scale,
      y: firstTouch.clientY / scale
    };
  }

  return {
    x: (e.clientX - shift) / scale,
    y: e.clientY / scale
  };
};