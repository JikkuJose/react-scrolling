'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getAllScrollerPositions = exports.getScrollerSpring = exports.getScrollerPosition = exports.getScroller = exports.moveScrollerNewPartialState = exports.scrollerExists = exports.getSpringStyle = exports.foreachScroller = exports.getInitialState = exports.getInitialScrollerState = exports.getInitialPosition = undefined;

var _ArrayPropValue = require('./ArrayPropValue');

var _Pagination = require('../consts/Pagination');

var Pagination = _interopRequireWildcard(_Pagination);

var _logic = require('../utils/logic');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var getInitialPosition = exports.getInitialPosition = function getInitialPosition(scrollerId, props) {
  var pagination = (0, _ArrayPropValue.getPropValueForScroller)(scrollerId, props.id, props.pagination);
  if (pagination === Pagination.First) {
    var pageSize = (0, _ArrayPropValue.getPropValueForScroller)(scrollerId, props.id, props.page.size);
    var pageMargin = (0, _ArrayPropValue.getPropValueForScroller)(scrollerId, props.id, props.page.margin);
    return -(pageSize + 2 * pageMargin);
  }
  return 0;
};

var getInitialScrollerState = exports.getInitialScrollerState = function getInitialScrollerState(scrollerId, props) {
  return {
    position: getInitialPosition(scrollerId, props),
    spring: null
  };
};

var getInitialState = exports.getInitialState = function getInitialState(props) {
  var scrollerIds = [];
  var scrollers = [];
  if (typeof props.id === 'string') {
    scrollerIds.push(props.id);
    scrollers.push(getInitialScrollerState(props.id, props));
  } else {
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = props.id[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var id = _step.value;

        scrollerIds.push(id);
        scrollers.push(getInitialScrollerState(id, props));
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
  }
  return { scrollerIds: scrollerIds, scrollers: scrollers };
};

var foreachScroller = exports.foreachScroller = function foreachScroller(state, callback) {
  var scrollerIds = state.scrollerIds;
  var scrollers = state.scrollers;

  for (var i = 0; i < scrollerIds.length; ++i) {
    callback(scrollerIds[i], scrollers[i]);
  }
};

var getSpringStyle = exports.getSpringStyle = function getSpringStyle(state) {
  var springStyle = {};
  foreachScroller(state, function (scrollerId, scroller) {
    springStyle[scrollerId] = (0, _logic.getSpringStyleForScroller)(scroller);
  });
  return springStyle;
};

var scrollerExists = exports.scrollerExists = function scrollerExists(state, scrollerId) {
  return state.scrollerIds.indexOf(scrollerId) >= 0;
};

var moveScrollerNewPartialState = exports.moveScrollerNewPartialState = function moveScrollerNewPartialState(oldState, scrollerId, newPosition, springValue) {
  var scrollerIds = oldState.scrollerIds;
  var scrollers = oldState.scrollers;

  var newScrollers = [].concat(_toConsumableArray(scrollers));
  var index = scrollerIds.indexOf(scrollerId);
  newScrollers[index] = (0, _logic.getPositionAndSpring)(newPosition, springValue);
  return {
    scrollers: newScrollers
  };
};

var getScroller = exports.getScroller = function getScroller(state, scrollerId) {
  var scrollerIds = state.scrollerIds;
  var scrollers = state.scrollers;

  var index = scrollerIds.indexOf(scrollerId);
  return scrollers[index];
};

var getScrollerPosition = exports.getScrollerPosition = function getScrollerPosition(state, scrollerId) {
  return getScroller(state, scrollerId).position;
};

var getScrollerSpring = exports.getScrollerSpring = function getScrollerSpring(state, scrollerId) {
  return getScroller(state, scrollerId).spring;
};

var getAllScrollerPositions = exports.getAllScrollerPositions = function getAllScrollerPositions(state) {
  var positions = {};
  foreachScroller(state, function (scrollerId, scroller) {
    positions[scrollerId] = scroller.position;
  });
  return positions;
};