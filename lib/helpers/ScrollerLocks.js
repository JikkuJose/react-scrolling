"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var scrollerLocks = {};

var setScrollerLock = exports.setScrollerLock = function setScrollerLock(orientation, scrollerId) {
  scrollerLocks[orientation] = scrollerId;
};

var getScrollerLock = exports.getScrollerLock = function getScrollerLock(orientation) {
  return scrollerLocks[orientation];
};

var emptyScrollerLock = exports.emptyScrollerLock = function emptyScrollerLock(orientation) {
  scrollerLocks[orientation] = undefined;
};

var isScrollerLocked = exports.isScrollerLocked = function isScrollerLocked(orientation) {
  return scrollerLocks[orientation] !== undefined;
};