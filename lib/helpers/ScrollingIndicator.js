"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var scrolling = false;

// should be true even after scrolling is finished
// to check inside click event
var isScrolling = exports.isScrolling = function isScrolling() {
  return scrolling;
};

var startScrolling = exports.startScrolling = function startScrolling() {
  scrolling = true;
};

var resetScrolling = exports.resetScrolling = function resetScrolling() {
  scrolling = false;
};