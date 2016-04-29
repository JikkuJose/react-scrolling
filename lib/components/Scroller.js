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

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

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

var Scroller = exports.Scroller = (_class = function (_React$Component) {
  _inherits(Scroller, _React$Component);

  function Scroller(props) {
    _classCallCheck(this, Scroller);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Scroller).call(this, props));

    _this.state = {};
    if (typeof props.id === 'string') {
      _this.setInitialState(props.id, props);
    } else {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = props.id[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var id = _step.value;

          _this.setInitialState(id, props);
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
    _this.autosize = props.size.content === undefined;
    return _this;
  }

  _createClass(Scroller, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      this.updateContentSize();
      this.correctOutOfTheBox(this.props, null);
      if (this.props.loop) {
        this.correctPagination(this.props, null);
      }
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(props) {
      this.updateContentSize();
      if (!this.lock) {
        this.correctPagination(props, null);
        if (!this.props.loop) {
          this.correctOutOfTheBox(props);
        }
      }
    }
  }, {
    key: 'getInitialPosition',
    value: function getInitialPosition(scrollerId) {
      var props = arguments.length <= 1 || arguments[1] === undefined ? this.props : arguments[1];

      var pagination = (0, _ArrayPropValue.getPropValueForScroller)(scrollerId, props.id, props.pagination);
      if (pagination === Pagination.First) {
        var pageSize = (0, _ArrayPropValue.getPropValueForScroller)(scrollerId, props.id, props.page.size);
        var pageMargin = (0, _ArrayPropValue.getPropValueForScroller)(scrollerId, props.id, props.page.margin);
        return -(pageSize + 2 * pageMargin);
      }
      return 0;
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
    key: 'getSpringStyle',
    value: function getSpringStyle() {
      var springStyle = {};
      var state = this.state;
      for (var scrollerId in state) {
        if (state.hasOwnProperty(scrollerId)) {
          springStyle[scrollerId] = (0, _logic.getSpringStyleForScroller)(state[scrollerId]);
        }
      }
      return springStyle;
    }
  }, {
    key: 'getTransformString',
    value: function getTransformString(position) {
      var translate = { x: 0, y: 0 };
      translate[_OrientationHelpers.orientationProp[this.props.orientation]] = position;
      return 'translate3d(' + translate.x + 'px, ' + translate.y + 'px, 0px)';
    }
  }, {
    key: 'getFinalPosition',
    value: function getFinalPosition(newPosition) {
      if (!this.props.loop) {
        return (0, _PositionCorrectors.outOfTheBoxCorrection)(newPosition, this.lock.scroller, this.props, this.contentAutoSize);
      }
      return newPosition;
    }
  }, {
    key: 'setLockerEmpty',
    value: function setLockerEmpty(orientation) {
      this.lock = undefined;
      Scroller.Locks[orientation] = undefined;
    }
  }, {
    key: 'setLocker',
    value: function setLocker(orientation, scroller, coordinateValue) {
      this.lock = {
        scroller: scroller,
        coordinateValue: coordinateValue
      };
      Scroller.Locks[orientation] = scroller;
    }
  }, {
    key: 'moveScroller',
    value: function moveScroller(newPosition) {
      var id = arguments.length <= 1 || arguments[1] === undefined ? this.props.id : arguments[1];
      var springValue = arguments.length <= 2 || arguments[2] === undefined ? Springs.Normal : arguments[2];

      if (id in this.state) {
        this.setState(_defineProperty({}, id, (0, _logic.getPositionAndSpring)(newPosition, springValue)));
      }
    }
  }, {
    key: 'moveScrollerWithinBox',
    value: function moveScrollerWithinBox(delta, scrollerId) {
      var state = this.state;
      if (scrollerId in state) {
        var oldPosition = state[scrollerId].position;
        var newPosition = oldPosition + delta;
        var finalPosition = (0, _PositionCorrectors.outOfTheBoxCorrection)(newPosition, scrollerId, this.props, this.contentAutoSize);
        if (finalPosition !== oldPosition) {
          this.moveScroller(finalPosition, scrollerId);
          return true;
        }
      }
      return false;
    }
  }, {
    key: 'moveScrollerToPage',
    value: function moveScrollerToPage(page, scrollerId, margin) {
      if (scrollerId in this.state) {
        var position = (0, _PositionCorrectors.pagePositionForScroller)(page, scrollerId, this.props, margin);
        this.moveScroller(position, scrollerId);
      }
    }
  }, {
    key: 'currentPage',
    value: function currentPage(scrollerId) {
      var state = this.state;
      if (scrollerId in state) {
        return (0, _PositionCorrectors.pageNumberForPosition)(state[scrollerId].position, scrollerId, this.props);
      }
      return undefined;
    }
  }, {
    key: 'isScrolling',
    value: function isScrolling() {
      return this.lock !== undefined && this.lock.swiped;
    }
  }, {
    key: 'releaseScroller',
    value: function releaseScroller() {
      this.handleEventEnd({
        gesture: (0, _logic.getEmptyVelocity)()
      });
    }
  }, {
    key: 'scrollerPosition',
    value: function scrollerPosition() {
      var scrollerId = arguments.length <= 0 || arguments[0] === undefined ? this.props.id : arguments[0];

      return this.state[scrollerId].position;
    }
  }, {
    key: 'allPositions',
    value: function allPositions() {
      var scrolelrs = {};
      var state = this.state;
      for (var scrollerId in state) {
        if (state.hasOwnProperty(scrollerId)) {
          scrolelrs[scrollerId] = state[scrollerId].position;
        }
      }
      return scrolelrs;
    }
  }, {
    key: 'correctOutOfTheBox',
    value: function correctOutOfTheBox() {
      var props = arguments.length <= 0 || arguments[0] === undefined ? this.props : arguments[0];
      var springValue = arguments.length <= 1 || arguments[1] === undefined ? Springs.Normal : arguments[1];

      var state = this.state;
      for (var scrollerId in state) {
        if (!state.hasOwnProperty(scrollerId)) {
          return;
        }
        var oldPosition = state[scrollerId].position;
        var newPosition = (0, _PositionCorrectors.outOfTheBoxCorrection)(oldPosition, scrollerId, props, this.contentAutoSize);
        if (newPosition !== oldPosition) {
          this.moveScroller(newPosition, scrollerId, springValue);
        }
      }
    }
  }, {
    key: 'correctPagination',
    value: function correctPagination() {
      var props = arguments.length <= 0 || arguments[0] === undefined ? this.props : arguments[0];
      var springValue = arguments.length <= 1 || arguments[1] === undefined ? Springs.Normal : arguments[1];

      var state = this.state;
      for (var scrollerId in state) {
        if (!state.hasOwnProperty(scrollerId)) {
          return;
        }
        if ((0, _ArrayPropValue.getPropValueForScroller)(scrollerId, props.id, props.pagination) !== Pagination.None) {
          var oldPosition = state[scrollerId].position;
          var ignorePagination = oldPosition === 0 && !props.loop;
          if (!ignorePagination) {
            var newPosition = (0, _PositionCorrectors.paginationCorrection)(oldPosition, scrollerId, props, 0, undefined, // prevSinglePage
            props.pagination === Pagination.First);
            if (newPosition !== oldPosition) {
              this.moveScroller(newPosition, scrollerId, springValue);
            }
          }
        }
      }
    }
  }, {
    key: 'correctPosition',
    value: function correctPosition() {
      this.correctPagination();
      this.correctOutOfTheBox();
    }
  }, {
    key: 'setInitialState',
    value: function setInitialState(scrollerId, props) {
      this.state[scrollerId] = {
        position: this.getInitialPosition(scrollerId, props),
        spring: Springs.Normal
      };
    }
  }, {
    key: 'lockPage',
    value: function lockPage() {
      var scroller = this.lock.scroller;
      var _props = this.props;
      var id = _props.id;
      var pagination = _props.pagination;

      if ((0, _ArrayPropValue.getPropValueForScroller)(scroller, id, pagination) === Pagination.Single) {
        this.lock.page = this.currentPage(scroller);
      }
    }
  }, {
    key: 'stopLockedScroller',
    value: function stopLockedScroller() {
      var scroller = this.lock.scroller;

      if (this.lastRenderedStyle[scroller] !== this.state[scroller].position) {
        this.moveScroller(this.lastRenderedStyle[scroller], scroller, null);
        this.lock.swiped = true;
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
      var outOfTheBoxCorrectionPos = (0, _PositionCorrectors.outOfTheBoxCorrection)(position, this.lock.scroller, this.props, this.contentAutoSize);
      return outOfTheBoxCorrectionPos !== position;
    }
  }, {
    key: 'handleEventBegin',
    value: function handleEventBegin(e) {
      var orientation = this.props.orientation;

      if (!this.lock && !Scroller.Locks[orientation]) {
        var coordinates = (0, _coordinatesFromEvent.eventCoordinates)(e, this.props.scale, Scroller.windowWidth);
        var coordinateValue = coordinates[_OrientationHelpers.orientationProp[orientation]];
        var scroller = (0, _ScrollerOnPoint.scrollerOnPoint)(coordinates, this.props);
        if (scroller) {
          this.setLocker(orientation, scroller, coordinateValue);
          this.lockPage();
          this.stopLockedScroller();
        }
      }
    }
  }, {
    key: 'handleEventEnd',
    value: function handleEventEnd(e) {
      var orientation = this.props.orientation;

      if (!this.lock || !this.lock.swiped) {
        this.setLockerEmpty(orientation);
        return;
      }
      var signedVelocity = this.getSignedVelocity(e);
      var newPosition = this.state[this.lock.scroller].position;
      var pagination = (0, _ArrayPropValue.getPropValueForScroller)(this.lock.scroller, this.props.id, this.props.pagination);
      if (pagination === Pagination.Single) {
        newPosition = (0, _PositionCorrectors.paginationCorrection)(newPosition, this.lock.scroller, this.props, Math.sign(signedVelocity), this.lock.page);
      } else {
        newPosition = (0, _PositionCorrectors.velocityPositionCorrection)(newPosition, this.lock.scroller, signedVelocity);
        if (pagination === Pagination.Multiple || pagination === Pagination.First) {
          newPosition = (0, _PositionCorrectors.paginationCorrection)(newPosition, this.lock.scroller, this.props, 0, undefined, // prevSinglePage
          pagination === Pagination.First);
        }
      }
      var finalPosition = this.getFinalPosition(newPosition);
      var paginationSpring = (0, _effects.getSpringByPagination)(pagination);
      var adjustedSpring = (0, _effects.getAdjustedSpring)(paginationSpring);
      this.moveScroller(finalPosition, this.lock.scroller, adjustedSpring);
      this.setLockerEmpty(orientation);
    }
  }, {
    key: 'handleSwipe',
    value: function handleSwipe(e) {
      if (!this.isSwipeInRightDirection(e)) {
        return;
      }
      var orientation = this.props.orientation;

      if (this.lock && Scroller.Locks[orientation] === this.lock.scroller) {
        var coordinates = (0, _coordinatesFromEvent.eventCoordinates)(e, this.props.scale, Scroller.windowWidth);
        var coordinateValue = coordinates[_OrientationHelpers.orientationProp[orientation]];
        var delta = coordinateValue - this.lock.coordinateValue;
        var oldPosition = this.state[this.lock.scroller].position;
        var newPosition = oldPosition + delta;
        if (this.isOutOfTheBox(newPosition)) {
          newPosition = oldPosition + delta * Config.OUT_OF_THE_BOX_ACCELERATION;
        }
        this.lock.coordinateValue = coordinateValue;
        this.lock.swiped = true;
        this.moveScroller(newPosition, this.lock.scroller);
      }
    }
  }, {
    key: 'updateContentSize',
    value: function updateContentSize() {
      if (!this.autosize || this.contentDom === undefined) {
        return;
      }
      var sizeProp = _OrientationHelpers.orientationSize[this.props.orientation];
      var capitalSizeProp = sizeProp.charAt(0).toUpperCase() + sizeProp.slice(1);
      this.contentAutoSize = this.contentDom['client' + capitalSizeProp];
    }
  }, {
    key: 'initContentDom',
    value: function initContentDom(ref) {
      this.contentDom = ref;
    }
  }, {
    key: 'render',
    value: function render() {
      var _this2 = this;

      var springStyle = this.getSpringStyle();
      return _react2.default.createElement(
        _reactMotion.Motion,
        { style: springStyle },
        function (style) {
          _this2.lastRenderedStyle = style;
          var children = null;
          if (typeof _this2.props.id === 'string') {
            if (typeof _this2.props.children === 'function') {
              var pos = style[_this2.props.id];
              if (_this2.props.loop) {
                pos = _this2.correctLoopPosition(pos, _this2.props.size.content, _this2.contentAutoSize);
              }
              children = _this2.props.children(pos);
            } else {
              var _props2 = _this2.props;
              var orientation = _props2.orientation;
              var size = _props2.size;

              var containerStyle = (0, _styleApi.getContainerWithOrientationStyle)(orientation, size);
              var containerItemStyle = {
                transform: _this2.getTransformString(style[_this2.props.id])
              };
              children = _react2.default.createElement(
                'div',
                { style: containerStyle },
                _react2.default.createElement(
                  'div',
                  { style: containerItemStyle, ref: _this2.initContentDom },
                  _this2.props.children
                )
              );
            }
          } else {
            children = _this2.props.children(style);
          }
          if (children instanceof Array) {
            children = _react2.default.createElement(
              'div',
              null,
              children
            );
          }
          return _react2.default.createElement(
            _reactGesture2.default,
            {
              onTouchStart: _this2.handleEventBegin,
              onMouseDown: _this2.handleEventBegin,
              onTouchEnd: _this2.handleEventEnd,
              onMouseUp: _this2.handleEventEnd,
              onSwipeLeft: _this2.handleSwipe,
              onSwipeRight: _this2.handleSwipe,
              onSwipeUp: _this2.handleSwipe,
              onSwipeDown: _this2.handleSwipe
            },
            children
          );
        }
      );
    }
  }]);

  return Scroller;
}(_react2.default.Component), (_applyDecoratedDescriptor(_class.prototype, 'handleEventBegin', [_autobindDecorator2.default], Object.getOwnPropertyDescriptor(_class.prototype, 'handleEventBegin'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'handleEventEnd', [_autobindDecorator2.default], Object.getOwnPropertyDescriptor(_class.prototype, 'handleEventEnd'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'handleSwipe', [_autobindDecorator2.default], Object.getOwnPropertyDescriptor(_class.prototype, 'handleSwipe'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'initContentDom', [_autobindDecorator2.default], Object.getOwnPropertyDescriptor(_class.prototype, 'initContentDom'), _class.prototype)), _class);


Scroller.Locks = {};
Scroller.windowWidth = window.innerWidth;

Scroller.valueOrArray = function (ReactType) {
  return _react2.default.PropTypes.oneOfType([ReactType, _react2.default.PropTypes.arrayOf(ReactType)]);
};

Scroller.enumType = function (Enum) {
  return _react2.default.PropTypes.oneOf(Object.keys(Enum).map(function (key) {
    return Enum[key];
  }));
};

var propTypes = {
  id: Scroller.valueOrArray(_react2.default.PropTypes.string).isRequired,
  orientation: Scroller.enumType(Orientation),
  pagination: Scroller.valueOrArray(Scroller.enumType(Pagination)),
  center: Scroller.valueOrArray(_react2.default.PropTypes.bool),
  loop: Scroller.valueOrArray(_react2.default.PropTypes.bool),
  size: _react2.default.PropTypes.shape({
    container: Scroller.valueOrArray(_react2.default.PropTypes.number).isRequired,
    content: Scroller.valueOrArray(_react2.default.PropTypes.number)
  }).isRequired,
  page: _react2.default.PropTypes.shape({
    size: Scroller.valueOrArray(_react2.default.PropTypes.number),
    margin: Scroller.valueOrArray(_react2.default.PropTypes.number)
  }),
  multiple: _react2.default.PropTypes.shape({
    before: _react2.default.PropTypes.number,
    between: _react2.default.PropTypes.number,
    size: _react2.default.PropTypes.number
  }),
  scale: _react2.default.PropTypes.number,
  children: _react2.default.PropTypes.oneOfType([_react2.default.PropTypes.func, _react2.default.PropTypes.node])
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