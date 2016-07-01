'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Scroller = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _desc, _value, _class;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _autobindDecorator = require('autobind-decorator');

var _autobindDecorator2 = _interopRequireDefault(_autobindDecorator);

var _reactGesture = require('react-gesture');

var _reactGesture2 = _interopRequireDefault(_reactGesture);

var _coordinatesFromEvent = require('../helpers/coordinatesFromEvent');

var _reactMotion = require('react-motion');

var _config = require('../config');

var Config = _interopRequireWildcard(_config);

var _Orientation = require('../consts/Orientation');

var Orientation = _interopRequireWildcard(_Orientation);

var _Pagination = require('../consts/Pagination');

var Pagination = _interopRequireWildcard(_Pagination);

var _Springs = require('../consts/Springs');

var Springs = _interopRequireWildcard(_Springs);

var _ScrollerOnPoint = require('../helpers/ScrollerOnPoint');

var _PositionCorrectors = require('../helpers/PositionCorrectors');

var _ArrayPropValue = require('../helpers/ArrayPropValue');

var _OrientationHelpers = require('../helpers/OrientationHelpers');

var _effects = require('../utils/effects');

var _styleApi = require('../utils/style-api');

var _properties = require('../utils/properties');

var _logic = require('../utils/logic');

var _StateHelpers = require('../helpers/StateHelpers');

var _ScrollerLocks = require('../helpers/ScrollerLocks');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
  var desc = {};
  Object['ke' + 'ys'](descriptor).forEach(function (key) {
    desc[key] = descriptor[key];
  });
  desc.enumerable = !!desc.enumerable;
  desc.configurable = !!desc.configurable;

  if ('value' in desc || desc.initializer) {
    desc.writable = true;
  }

  desc = decorators.slice().reverse().reduce(function (desc, decorator) {
    return decorator(target, property, desc) || desc;
  }, desc);

  if (context && desc.initializer !== void 0) {
    desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
    desc.initializer = undefined;
  }

  if (desc.initializer === void 0) {
    Object['define' + 'Property'](target, property, desc);
    desc = null;
  }

  return desc;
}

var defaultProps = {
  scale: 1,
  orientation: Orientation.Vertiacal,
  pagination: Pagination.None,
  center: false,
  loop: false
};

var windowWidth = window.innerWidth;

var Scroller = exports.Scroller = (_class = function (_React$Component) {
  _inherits(Scroller, _React$Component);

  function Scroller(props) {
    _classCallCheck(this, Scroller);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Scroller).call(this, props));

    _this.state = (0, _StateHelpers.getInitialState)(props);
    return _this;
  }

  _createClass(Scroller, [{
    key: 'componentWillMount',
    value: function componentWillMount() {
      this.componentWillReceiveProps(this.props, undefined, true);
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      if (this.updateContentSize()) {
        this.correctOutOfTheBox(this.props, null);
        if (this.props.loop) {
          this.correctPagination(this.props, null);
        }
      }

      var stringId = this.getStringId();
      var wrapper = document.getElementById(stringId);
      wrapper.addEventListener('click', this.disableClick, true);
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps, nextContext) {
      var _this2 = this;

      var noAnimation = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

      this.updateContentSize(nextProps);
      var positionChanged = false;
      (0, _StateHelpers.foreachScroller)(this.state, function (scrollerId) {
        var oldPosition = _this2.getPropPositionObject(_this2.props, scrollerId);
        var newPosition = _this2.getPropPositionObject(nextProps, scrollerId);
        if (newPosition === undefined) {
          return;
        }
        if (newPosition.value !== undefined && (oldPosition === undefined || oldPosition.value !== newPosition.value)) {
          _this2.moveScroller(newPosition.value, scrollerId, noAnimation ? null : newPosition.spring);
          positionChanged = true;
          return;
        }
        if (newPosition.page !== undefined) {
          _this2.moveScrollerToPage(newPosition.page, scrollerId, undefined, noAnimation ? null : newPosition.spring);
          positionChanged = true;
          return;
        }
      });
      if (!positionChanged && !this.getLock()) {
        this.correctPagination(nextProps, null);
        if (!nextProps.loop) {
          this.correctOutOfTheBox(nextProps, null);
        }
      }
    }
  }, {
    key: 'shouldComponentUpdate',
    value: function shouldComponentUpdate() /* nextProps, nextState */{
      return true;
      /*
      for (let i = 0; i < nextState.scrollers.length; ++i) {
        if (nextState.scrollers[i].position !== this.state.scrollers[i].position) {
          return true;
        }
      }
      if (nextProps.size !== this.props.size) {
        return true;
      }
      if (nextProps.size.container !== this.props.size.container) {
        return true;
      }
      if (nextProps.size.content !== this.props.size.content) {
        return true;
      }
      if (nextProps.page !== this.props.page) {
        return true;
      }
      if (nextProps.page !== undefined) {
        if (nextProps.page.size !== this.props.page.size) {
          return true;
        }
        if (nextProps.page.margin !== this.props.page.margin) {
          return true;
        }
      }
      if (nextProps.multiple !== this.props.multiple) {
        return true;
      }
      if (nextProps.multiple !== undefined) {
        if (nextProps.multiple.before !== this.props.multiple.before) {
          return true;
        }
        if (nextProps.multiple.between !== this.props.multiple.between) {
          return true;
        }
        if (nextProps.multiple.size !== this.props.multiple.size) {
          return true;
        }
      }
      return false;
      */
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate() {
      if (this.updateContentSize()) {
        if (!this.getLock()) {
          this.correctPagination(this.props, null);
          if (!this.props.loop) {
            this.correctOutOfTheBox(this.props);
          }
        }
      }
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      var stringId = this.getStringId();
      var wrapper = document.getElementById(stringId);
      wrapper.removeEventListener('click', this.disableClick, true);
    }
  }, {
    key: 'onEventBegin',
    value: function onEventBegin(e) {
      var orientation = this.props.orientation;

      if (!this.getLock() && !(0, _ScrollerLocks.isScrollerLocked)(orientation)) {
        var coordinates = (0, _coordinatesFromEvent.eventCoordinates)(e, this.props.scale, windowWidth);
        var coordinateValue = (0, _logic.getCoordinatesByOrientation)(coordinates, orientation);
        var scroller = (0, _ScrollerOnPoint.scrollerOnPoint)(coordinates, this.props);
        if (scroller) {
          this.setLocker(orientation, scroller, coordinateValue);
          this.lockPage();
          this.stopLockedScroller();
          this.resetScrolling();
        }
      }
    }
  }, {
    key: 'onEventEnd',
    value: function onEventEnd(e) {
      var orientation = this.props.orientation;

      if (!this.getLock() || !this.getLockedSwiped()) {
        this.setLockerEmpty(orientation);
        return;
      }
      var signedVelocity = this.getSignedVelocity(e);
      var scrollerId = this.getLockedScroller();
      var oldPosition = (0, _StateHelpers.getScrollerPosition)(this.state, scrollerId);
      var newPosition = oldPosition;
      var pagination = (0, _ArrayPropValue.getPropValueForScroller)(scrollerId, this.props.id, this.props.pagination);
      if (pagination === Pagination.Single) {
        newPosition = (0, _PositionCorrectors.paginationCorrection)(oldPosition, scrollerId, this.props, Math.sign(signedVelocity), this.getLockedPage());
      } else {
        oldPosition = (0, _PositionCorrectors.velocityPositionCorrection)(oldPosition, scrollerId, signedVelocity);
        newPosition = oldPosition;
        if (pagination === Pagination.Multiple || pagination === Pagination.First) {
          newPosition = (0, _PositionCorrectors.paginationCorrection)(oldPosition, scrollerId, this.props, 0, undefined, // prevSinglePage
          pagination === Pagination.First);
        }
      }
      newPosition = this.getFinalPosition(newPosition);
      var paginationSpring = (0, _effects.getSpringByPagination)(pagination);
      var adjustedSpring = (0, _effects.getAdjustedSpring)(oldPosition, newPosition, paginationSpring);
      if ((0, _StateHelpers.getScrollerPosition)(this.state, scrollerId) !== newPosition) {
        this.checkPageChanged(scrollerId, newPosition);
        this.moveScroller(newPosition, scrollerId, adjustedSpring);
        this.autoScrolling = true;
      }
      this.setLockerEmpty(orientation);
    }
  }, {
    key: 'onSwipe',
    value: function onSwipe(e) {
      if (!this.isSwipeInRightDirection(e)) {
        return;
      }
      var orientation = this.props.orientation;

      if (this.getLock() && (0, _ScrollerLocks.getScrollerLock)(orientation) === this.getLockedScroller()) {
        var scrollerId = this.getLockedScroller();
        var coordinates = (0, _coordinatesFromEvent.eventCoordinates)(e, this.props.scale, windowWidth);
        var coordinateValue = (0, _logic.getCoordinatesByOrientation)(coordinates, orientation);
        var delta = coordinateValue - this.getLockedCoordinateValue();
        var oldPosition = (0, _StateHelpers.getScrollerPosition)(this.state, scrollerId);
        var newPosition = oldPosition + delta;
        if (this.isOutOfTheBox(newPosition)) {
          newPosition = oldPosition + delta * Config.OUT_OF_THE_BOX_ACCELERATION;
        }
        this.setLockedCoordinateValue(coordinateValue);
        this.setLockedSwiped(true);
        this.startScrolling();
        this.callOnScrollStarted();
        this.moveScroller(newPosition, scrollerId);
      }
    }
  }, {
    key: 'onSetContentDom',
    value: function onSetContentDom(ref) {
      this.contentDom = ref;
    }
  }, {
    key: 'getSignedVelocity',
    value: function getSignedVelocity(e) {
      var orientation = this.props.orientation;

      var velocityProp = (0, _properties.getVelocityProp)(orientation);
      var signedVelocity = e.gesture[velocityProp];
      if (Math.abs(signedVelocity) < Config.FLICK_THRESHOLD) {
        return 0;
      }
      var deltaProp = (0, _properties.getDeltaProp)(orientation);
      return signedVelocity * Math.sign(e.gesture[deltaProp]);
    }
  }, {
    key: 'getTransformString',
    value: function getTransformString(position) {
      var initTranslate = { x: 0, y: 0 };
      var orientation = this.props.orientation;

      var translate = (0, _logic.setOrientationPos)(initTranslate, orientation, position);
      return (0, _properties.getTranslate3D)(translate);
    }
  }, {
    key: 'getFinalPosition',
    value: function getFinalPosition(newPosition) {
      if (this.props.loop) {
        return newPosition;
      }
      return (0, _PositionCorrectors.outOfTheBoxCorrection)(newPosition, this.getLockedScroller(), this.props, this.contentAutoSize);
    }
  }, {
    key: 'getPropPositionObject',
    value: function getPropPositionObject(props, scroller) {
      var positionProp = (0, _ArrayPropValue.getPropValueForScroller)(scroller, props.id, props.position);
      if (typeof positionProp === 'number') {
        return {
          value: positionProp,
          spring: Springs.Normal
        };
      }
      return positionProp;
    }
  }, {
    key: 'getLock',
    value: function getLock() {
      return this.lock;
    }
  }, {
    key: 'getLockedScroller',
    value: function getLockedScroller() {
      return this.lock.scroller;
    }
  }, {
    key: 'getLockedSwiped',
    value: function getLockedSwiped() {
      return this.lock.swiped;
    }
  }, {
    key: 'getLockedPage',
    value: function getLockedPage() {
      return this.lock.page;
    }
  }, {
    key: 'getLockedCoordinateValue',
    value: function getLockedCoordinateValue() {
      return this.lock.coordinateValue;
    }
  }, {
    key: 'setLock',
    value: function setLock(lock) {
      this.lock = lock;
    }
  }, {
    key: 'setLockedCoordinateValue',
    value: function setLockedCoordinateValue(coordinateValue) {
      this.lock.coordinateValue = coordinateValue;
    }
  }, {
    key: 'setLockedPageLocked',
    value: function setLockedPageLocked() {
      var _getLock = this.getLock();

      var scroller = _getLock.scroller;

      this.lock.page = this.currentPage(scroller);
    }
  }, {
    key: 'setLockedSwiped',
    value: function setLockedSwiped(swiped) {
      this.lock.swiped = swiped;
    }
  }, {
    key: 'setLockerEmpty',
    value: function setLockerEmpty(orientation) {
      this.lock = undefined;
      (0, _ScrollerLocks.emptyScrollerLock)(orientation);
    }
  }, {
    key: 'setLocker',
    value: function setLocker(orientation, scroller, coordinateValue) {
      this.lock = {
        scroller: scroller,
        coordinateValue: coordinateValue
      };
      (0, _ScrollerLocks.setScrollerLock)(orientation, scroller);
    }
  }, {
    key: 'getLastRenderedStyle',
    value: function getLastRenderedStyle(scrollerId) {
      return this.lastRenderedStyle[scrollerId];
    }
  }, {
    key: 'getLastRenderedStyleForLocked',
    value: function getLastRenderedStyleForLocked() {
      return this.lastRenderedStyle[this.getLock().scroller];
    }
  }, {
    key: 'setLastRenderedStyle',
    value: function setLastRenderedStyle(style) {
      this.lastRenderedStyle = style;
    }
  }, {
    key: 'getStringId',
    value: function getStringId() {
      var id = this.props.id;

      return typeof id === 'string' ? id : id.join('+');
    }
  }, {
    key: 'moveScroller',
    value: function moveScroller(newPosition) {
      var id = arguments.length <= 1 || arguments[1] === undefined ? this.props.id : arguments[1];
      var springValue = arguments.length <= 2 || arguments[2] === undefined ? Springs.Normal : arguments[2];

      var state = this.state;
      if ((0, _StateHelpers.scrollerExists)(state, id)) {
        this.setState((0, _StateHelpers.moveScrollerNewPartialState)(state, id, newPosition, springValue));
      }
    }
  }, {
    key: 'moveScrollerWithinBox',
    value: function moveScrollerWithinBox(delta, scrollerId) {
      var state = this.state;
      if (!(0, _StateHelpers.scrollerExists)(state, scrollerId)) {
        return false;
      }
      var oldPosition = (0, _StateHelpers.getScrollerPosition)(state, scrollerId);
      var newPosition = oldPosition + delta;
      var finalPosition = (0, _PositionCorrectors.outOfTheBoxCorrection)(newPosition, scrollerId, this.props, this.contentAutoSize);
      if (finalPosition !== oldPosition) {
        this.moveScroller(finalPosition, scrollerId);
        return true;
      }
      return false;
    }
  }, {
    key: 'moveScrollerToPage',
    value: function moveScrollerToPage(page, scrollerId, margin, springValue) {
      if ((0, _StateHelpers.scrollerExists)(this.state, scrollerId)) {
        var position = (0, _PositionCorrectors.pagePositionForScroller)(page, scrollerId, this.props, margin);
        if (this.props.loop) {
          position = (0, _logic.closestLoopPosition)((0, _StateHelpers.getScrollerPosition)(this.state, scrollerId), position, this.props.size.content, this.contentAutoSize);
        }
        this.moveScroller(position, scrollerId, springValue);
      }
    }
  }, {
    key: 'currentPage',
    value: function currentPage(scrollerId) {
      var state = this.state;
      if (!(0, _StateHelpers.scrollerExists)(state, scrollerId)) {
        return undefined;
      }
      return (0, _PositionCorrectors.pageNumberForPosition)((0, _StateHelpers.getScrollerPosition)(state, scrollerId), scrollerId, this.props);
    }
  }, {
    key: 'isScrolling',
    value: function isScrolling() {
      return this.getLock() !== undefined && this.getLockedSwiped() || this.autoScrolling;
    }
  }, {
    key: 'wasScrolling',
    value: function wasScrolling() {
      return this.wasScrollingValue;
    }
  }, {
    key: 'startScrolling',
    value: function startScrolling() {
      this.wasScrollingValue = true;
    }
  }, {
    key: 'resetScrolling',
    value: function resetScrolling() {
      this.wasScrollingValue = false;
    }
  }, {
    key: 'releaseScroller',
    value: function releaseScroller() {
      this.onEventEnd({
        gesture: (0, _logic.getEmptyVelocity)()
      });
    }
  }, {
    key: 'scrollerPosition',
    value: function scrollerPosition() {
      var scrollerId = arguments.length <= 0 || arguments[0] === undefined ? this.props.id : arguments[0];

      return (0, _StateHelpers.getScrollerPosition)(this.state, scrollerId);
    }
  }, {
    key: 'allPositions',
    value: function allPositions() {
      return (0, _StateHelpers.getAllScrollerPositions)(this.state);
    }
  }, {
    key: 'correctOutOfTheBox',
    value: function correctOutOfTheBox() {
      var _this3 = this;

      var props = arguments.length <= 0 || arguments[0] === undefined ? this.props : arguments[0];
      var springValue = arguments.length <= 1 || arguments[1] === undefined ? Springs.Normal : arguments[1];

      var state = this.state;
      var moved = false;
      (0, _StateHelpers.foreachScroller)(state, function (scrollerId) {
        var oldPosition = (0, _StateHelpers.getScrollerPosition)(state, scrollerId);
        var newPosition = (0, _PositionCorrectors.outOfTheBoxCorrection)(oldPosition, scrollerId, props, _this3.contentAutoSize);
        var newSpringValue = springValue;
        if (_this3.lastRenderedStyle && newPosition !== _this3.getLastRenderedStyle(scrollerId) && (0, _StateHelpers.getScrollerSpring)(state, scrollerId) === null) {
          newSpringValue = null;
        }
        if (newPosition !== oldPosition) {
          _this3.moveScroller(newPosition, scrollerId, newSpringValue);
          moved = true;
        }
      });
      return moved;
    }
  }, {
    key: 'correctPagination',
    value: function correctPagination() {
      var _this4 = this;

      var props = arguments.length <= 0 || arguments[0] === undefined ? this.props : arguments[0];
      var springValue = arguments.length <= 1 || arguments[1] === undefined ? Springs.Normal : arguments[1];

      var state = this.state;
      var moved = false;
      (0, _StateHelpers.foreachScroller)(state, function (scrollerId) {
        if ((0, _ArrayPropValue.getPropValueForScroller)(scrollerId, props.id, props.pagination) !== Pagination.None) {
          var oldPosition = (0, _StateHelpers.getScrollerPosition)(state, scrollerId);
          var ignorePagination = oldPosition === 0 && !props.loop;
          if (!ignorePagination) {
            var newPosition = (0, _PositionCorrectors.paginationCorrection)(oldPosition, scrollerId, props, 0, undefined, // prevSinglePage
            props.pagination === Pagination.First);
            if (newPosition !== oldPosition) {
              _this4.moveScroller(newPosition, scrollerId, springValue);
              moved = true;
            }
          }
        }
      });
      return moved;
    }
  }, {
    key: 'correctPosition',
    value: function correctPosition() {
      this.correctPagination();
      this.correctOutOfTheBox();
    }
  }, {
    key: 'lockPage',
    value: function lockPage() {
      var _getLock2 = this.getLock();

      var scroller = _getLock2.scroller;
      var _props = this.props;
      var id = _props.id;
      var pagination = _props.pagination;

      var paginationType = (0, _ArrayPropValue.getPropValueForScroller)(scroller, id, pagination);
      if (paginationType === Pagination.Single || paginationType === Pagination.Multiple) {
        this.setLockedPageLocked();
      }
    }
  }, {
    key: 'stopLockedScroller',
    value: function stopLockedScroller() {
      var _getLock3 = this.getLock();

      var scroller = _getLock3.scroller;

      var diff = this.getLastRenderedStyleForLocked() - (0, _StateHelpers.getScrollerPosition)(this.state, scroller);
      var minDiff = Springs.Normal.precision / this.props.scale;
      if (Math.abs(diff) > minDiff) {
        this.moveScroller(this.getLastRenderedStyleForLocked(), scroller, null);
        this.setLockedSwiped(true);
      }
    }
  }, {
    key: 'checkPageChanged',
    value: function checkPageChanged(scrollerId, position) {
      var oldPage = this.getLockedPage();
      if (oldPage === undefined) {
        return;
      }
      var newPage = (0, _PositionCorrectors.pageNumberForPosition)(position, scrollerId, this.props);
      if (oldPage !== newPage) {
        this.callOnPageChanged(newPage);
      }
    }
  }, {
    key: 'isSwipeInRightDirection',
    value: function isSwipeInRightDirection(e) {
      var orientation = this.props.orientation;

      var direction = e.gesture.type.replace('swipe', '');
      return _OrientationHelpers.orientationDirection[orientation].indexOf(direction) >= 0;
    }
  }, {
    key: 'isOutOfTheBox',
    value: function isOutOfTheBox(position) {
      if (this.props.loop) {
        return false;
      }
      var outOfTheBoxCorrectionPos = (0, _PositionCorrectors.outOfTheBoxCorrection)(position, this.getLockedScroller(), this.props, this.contentAutoSize);
      return outOfTheBoxCorrectionPos !== position;
    }
  }, {
    key: 'updateContentSize',
    value: function updateContentSize() {
      var props = arguments.length <= 0 || arguments[0] === undefined ? this.props : arguments[0];

      var prevSize = this.contentAutoSize;
      var size = props.size;
      var page = props.page;
      var orientation = props.orientation;
      var pagination = props.pagination;

      if (size.content === undefined && this.contentDom !== undefined) {
        var sizeProp = _OrientationHelpers.orientationSize[orientation];
        var capitalSizeProp = sizeProp.charAt(0).toUpperCase() + sizeProp.slice(1);
        this.contentAutoSize = this.contentDom['client' + capitalSizeProp];
      }
      var contentSize = size.content || this.contentAutoSize;
      if (pagination === Pagination.First) {
        var minSize = size.container + page.size + page.margin;
        if (contentSize < minSize) {
          contentSize = minSize;
        }
        this.contentAutoSize = contentSize;
      }
      return this.contentAutoSize !== prevSize;
    }
  }, {
    key: 'callOnScroll',
    value: function callOnScroll(scrollerPosition) {
      var onScroll = this.props.onScroll;

      if (onScroll) {
        onScroll(scrollerPosition);
      }
    }
  }, {
    key: 'callOnPageChanged',
    value: function callOnPageChanged(page) {
      var onPageChanged = this.props.onPageChanged;

      if (onPageChanged) {
        onPageChanged(page);
      }
    }
  }, {
    key: 'callOnScrollStarted',
    value: function callOnScrollStarted() {
      var onScrollStarted = this.props.onScrollStarted;

      if (onScrollStarted) {
        onScrollStarted();
      }
    }
  }, {
    key: 'callOnScrollFinished',
    value: function callOnScrollFinished() {
      var onScrollFinished = this.props.onScrollFinished;

      if (onScrollFinished) {
        onScrollFinished();
      }
    }
  }, {
    key: 'disableClick',
    value: function disableClick(e) {
      if (this.wasScrolling()) {
        e.stopPropagation();
      }
    }
  }, {
    key: 'motionRest',
    value: function motionRest() {
      this.autoScrolling = false;
      this.callOnScrollFinished();
    }
  }, {
    key: 'renderChildren',
    value: function renderChildren(style) {
      if (typeof this.props.id === 'string') {
        var pos = style[this.props.id];
        if (this.props.loop) {
          pos = (0, _logic.correctLoopPosition)(pos, this.props.size.content, this.contentAutoSize);
        }
        this.callOnScroll(pos);
        if (typeof this.props.children === 'function') {
          return this.props.children(pos);
        }
        var _props2 = this.props;
        var orientation = _props2.orientation;
        var size = _props2.size;

        var containerStyle = (0, _styleApi.getContainerWithOrientationStyle)(orientation, size);
        var containerItemStyle = {
          transform: this.getTransformString(pos)
        };
        return _react2.default.createElement(
          'div',
          { style: containerStyle },
          _react2.default.createElement(
            'div',
            { style: containerItemStyle, ref: this.onSetContentDom },
            this.props.children
          )
        );
      }
      this.callOnScroll(style);
      return this.props.children(style);
    }
  }, {
    key: 'renderWrapped',
    value: function renderWrapped(children) {
      var stringId = this.getStringId();
      return _react2.default.createElement(
        'div',
        { id: stringId },
        children
      );
    }
  }, {
    key: 'render',
    value: function render() {
      var _this5 = this;

      var springStyle = (0, _StateHelpers.getSpringStyle)(this.state);
      return _react2.default.createElement(
        _reactMotion.Motion,
        { style: springStyle, onRest: this.motionRest },
        function (style) {
          _this5.setLastRenderedStyle(style);
          var children = _this5.renderChildren(style);
          return _react2.default.createElement(
            _reactGesture2.default,
            {
              onTouchStart: _this5.onEventBegin,
              onMouseDown: _this5.onEventBegin,
              onTouchEnd: _this5.onEventEnd,
              onMouseUp: _this5.onEventEnd,
              onSwipeLeft: _this5.onSwipe,
              onSwipeRight: _this5.onSwipe,
              onSwipeUp: _this5.onSwipe,
              onSwipeDown: _this5.onSwipe
            },
            _this5.renderWrapped(children)
          );
        }
      );
    }
  }]);

  return Scroller;
}(_react2.default.Component), (_applyDecoratedDescriptor(_class.prototype, 'onEventBegin', [_autobindDecorator2.default], Object.getOwnPropertyDescriptor(_class.prototype, 'onEventBegin'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'onEventEnd', [_autobindDecorator2.default], Object.getOwnPropertyDescriptor(_class.prototype, 'onEventEnd'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'onSwipe', [_autobindDecorator2.default], Object.getOwnPropertyDescriptor(_class.prototype, 'onSwipe'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'onSetContentDom', [_autobindDecorator2.default], Object.getOwnPropertyDescriptor(_class.prototype, 'onSetContentDom'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'disableClick', [_autobindDecorator2.default], Object.getOwnPropertyDescriptor(_class.prototype, 'disableClick'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'motionRest', [_autobindDecorator2.default], Object.getOwnPropertyDescriptor(_class.prototype, 'motionRest'), _class.prototype)), _class);


var valueOrArray = function valueOrArray(ReactType) {
  return _react2.default.PropTypes.oneOfType([ReactType, _react2.default.PropTypes.arrayOf(ReactType)]);
};
var enumType = function enumType(Enum) {
  return _react2.default.PropTypes.oneOf(Object.keys(Enum).map(function (key) {
    return Enum[key];
  }));
};

var propTypes = {
  id: valueOrArray(_react2.default.PropTypes.string).isRequired,
  orientation: enumType(Orientation),
  pagination: valueOrArray(enumType(Pagination)),
  center: valueOrArray(_react2.default.PropTypes.bool),
  loop: valueOrArray(_react2.default.PropTypes.bool),
  size: _react2.default.PropTypes.shape({
    container: valueOrArray(_react2.default.PropTypes.number).isRequired,
    content: valueOrArray(_react2.default.PropTypes.number)
  }).isRequired,
  page: _react2.default.PropTypes.shape({
    size: valueOrArray(_react2.default.PropTypes.number),
    margin: valueOrArray(_react2.default.PropTypes.number)
  }),
  multiple: _react2.default.PropTypes.shape({
    before: _react2.default.PropTypes.number,
    between: _react2.default.PropTypes.number,
    size: _react2.default.PropTypes.number
  }),
  scale: _react2.default.PropTypes.number,
  position: valueOrArray(_react2.default.PropTypes.oneOfType([_react2.default.PropTypes.number, _react2.default.PropTypes.shape({
    value: _react2.default.PropTypes.number,
    page: _react2.default.PropTypes.number,
    spring: _react2.default.PropTypes.any
  })])),
  children: _react2.default.PropTypes.oneOfType([_react2.default.PropTypes.func, _react2.default.PropTypes.node]),
  onScroll: _react2.default.PropTypes.func,
  onScrollStarted: _react2.default.PropTypes.func,
  onScrollFinished: _react2.default.PropTypes.func,
  onPageChanged: _react2.default.PropTypes.func
};

Scroller.propTypes = propTypes;
Scroller.defaultProps = defaultProps;

/*
const propsExample = {
  id: ['scr-a', 'scr-b'],
  orientation: Orientation.Horizontal, // single value only
  pagination: [Pagination.Multiple, Pagination.None],
  center: [true, false],
  size: {
    container: 1366,
    content: [900, 2000]
  },
  page: {
    size: 300,
    margin: 30
  },
  multiple: {
    before: 30,
    between: 200,
    size: 400
  }
};
*/