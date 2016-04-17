'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.Scroller = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _desc, _value, _class;

var _react = require('react');

var React = _interopRequireWildcard(_react);

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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

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
	center: false
};

var Scroller = exports.Scroller = (_class = function (_React$Component) {
	_inherits(Scroller, _React$Component);

	function Scroller(props) {
		_classCallCheck(this, Scroller);

		var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Scroller).call(this, props));

		_this.state = {};
		var defaultSingleState = {
			position: 0,
			spring: Springs.Normal
		};
		if (typeof props.id === 'string') {
			_this.state[props.id] = defaultSingleState;
		} else {
			var _iteratorNormalCompletion = true;
			var _didIteratorError = false;
			var _iteratorError = undefined;

			try {
				for (var _iterator = props.id[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
					var id = _step.value;

					_this.state[id] = Object.assign({}, defaultSingleState);
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
		_this.lock = null;
		_this.correctOutOfTheBox(props);
		return _this;
	}

	_createClass(Scroller, [{
		key: 'componentWillReceiveProps',
		value: function componentWillReceiveProps(props) {
			if (!this.lock) {
				this.correctPagination(props, Springs.Hard);
				this.correctOutOfTheBox(props);
			}
		}
	}, {
		key: 'moveScroller',
		value: function moveScroller(newPosition) {
			var id = arguments.length <= 1 || arguments[1] === undefined ? this.props.id : arguments[1];
			var springValue = arguments.length <= 2 || arguments[2] === undefined ? Springs.Normal : arguments[2];

			if (id in this.state) {
				var newPartialState = {};
				newPartialState[id] = {
					position: newPosition,
					spring: springValue
				};
				this.setState(newPartialState);
			}
		}
	}, {
		key: 'currentPage',
		value: function currentPage(scrollerId) {
			if (scrollerId in this.state) {
				return (0, _PositionCorrectors.pageNumberForPosition)(this.state[scrollerId].position, scrollerId, this.props);
			}
			return undefined;
		}
	}, {
		key: 'correctOutOfTheBox',
		value: function correctOutOfTheBox() {
			var props = arguments.length <= 0 || arguments[0] === undefined ? this.props : arguments[0];

			for (var scrollerId in this.state) {
				if (this.state.hasOwnProperty(scrollerId)) {
					var oldPosition = this.state[scrollerId].position;
					var newPosition = (0, _PositionCorrectors.outOfTheBoxCorrection)(oldPosition, scrollerId, props);
					if (newPosition !== oldPosition) {
						this.moveScroller(newPosition, scrollerId);
					}
				}
			}
		}
	}, {
		key: 'correctPagination',
		value: function correctPagination() {
			var props = arguments.length <= 0 || arguments[0] === undefined ? this.props : arguments[0];
			var springValue = arguments.length <= 1 || arguments[1] === undefined ? Springs.Normal : arguments[1];

			for (var scrollerId in this.state) {
				if (this.state.hasOwnProperty(scrollerId)) {
					if ((0, _ArrayPropValue.getPropValueForScroller)(scrollerId, props.id, props.pagination) !== Pagination.None) {
						var oldPosition = this.state[scrollerId].position;
						var newPosition = (0, _PositionCorrectors.paginationCorrection)(oldPosition, scrollerId, props);
						if (newPosition !== oldPosition && oldPosition !== 0) {
							this.moveScroller(newPosition, scrollerId, springValue);
						}
					}
				}
			}
		}
	}, {
		key: 'handleEventBegin',
		value: function handleEventBegin(e) {
			if (!this.lock) {
				var coordinates = (0, _coordinatesFromEvent.eventCoordinates)(e, this.props.scale);
				var coordinateValue = coordinates[_OrientationHelpers.orientationProp[this.props.orientation]];

				var scroller = (0, _ScrollerOnPoint.scrollerOnPoint)(coordinates, this.props);
				if (scroller) {
					this.lock = {
						scroller: scroller,
						coordinateValue: coordinateValue
					};
					if ((0, _ArrayPropValue.getPropValueForScroller)(scroller, this.props.id, this.props.pagination) === Pagination.Single) {
						this.lock.page = this.currentPage(scroller);
					}
					if (this.lastRenderedStyle[scroller] !== this.state[scroller].position) {
						this.moveScroller(this.lastRenderedStyle[scroller], scroller, Springs.Hard);
						this.lock.swiped = true;
					}
				}
			}
		}
	}, {
		key: 'handleEventEnd',
		value: function handleEventEnd(e) {
			if (this.lock && this.lock.swiped) {
				var velocityProp = 'velocity' + _OrientationHelpers.orientationProp[this.props.orientation].toUpperCase();
				var signedVelocity = e.gesture[velocityProp];
				if (Math.abs(signedVelocity) < Config.FLICK_THRESHOLD) {
					signedVelocity = 0;
				} else {
					var deltaProp = 'delta' + _OrientationHelpers.orientationProp[this.props.orientation].toUpperCase();
					signedVelocity *= Math.sign(e.gesture[deltaProp]);
				}

				var springValue = Springs.Move;
				var newPosition = this.state[this.lock.scroller].position;
				if ((0, _ArrayPropValue.getPropValueForScroller)(this.lock.scroller, this.props.id, this.props.pagination) === Pagination.Single) {
					newPosition = (0, _PositionCorrectors.paginationCorrection)(newPosition, this.lock.scroller, this.props, Math.sign(signedVelocity), this.lock.page);
				} else {
					newPosition = (0, _PositionCorrectors.velocityPositionCorrection)(newPosition, this.lock.scroller, signedVelocity);
					if ((0, _ArrayPropValue.getPropValueForScroller)(this.lock.scroller, this.props.id, this.props.pagination) === Pagination.Multiple) {
						newPosition = (0, _PositionCorrectors.paginationCorrection)(newPosition, this.lock.scroller, this.props);
						springValue = Springs.Bounce;
					}
				}

				var finalPosition = (0, _PositionCorrectors.outOfTheBoxCorrection)(newPosition, this.lock.scroller, this.props);
				if (newPosition !== finalPosition) {
					springValue = Springs.Bounce;
				}
				this.moveScroller(finalPosition, this.lock.scroller, springValue);
			}
			this.lock = null;
		}
	}, {
		key: 'handleSwipe',
		value: function handleSwipe(e) {
			var direction = e.gesture.type.replace('swipe', '');
			if (_OrientationHelpers.orientationDirection[this.props.orientation].indexOf(direction) >= 0) {
				if (this.lock) {
					var coordinates = (0, _coordinatesFromEvent.eventCoordinates)(e, this.props.scale);
					var coordinateValue = coordinates[_OrientationHelpers.orientationProp[this.props.orientation]];
					var delta = coordinateValue - this.lock.coordinateValue;

					var oldPosition = this.state[this.lock.scroller].position;
					var newPosition = oldPosition + delta;
					if ((0, _PositionCorrectors.outOfTheBoxCorrection)(newPosition, this.lock.scroller, this.props) !== newPosition) {
						newPosition = oldPosition + delta * Config.OUT_OF_THE_BOX_ACCELERATION;
					}

					this.lock.coordinateValue = coordinateValue;
					this.lock.swiped = true;
					this.moveScroller(newPosition, this.lock.scroller);
				}
			}
		}
	}, {
		key: 'render',
		value: function render() {
			var _this2 = this;

			var springStyle = {};
			var state = this.state;
			for (var scrollerId in state) {
				if (state.hasOwnProperty(scrollerId)) {
					springStyle[scrollerId] = (0, _reactMotion.spring)(state[scrollerId].position, state[scrollerId].spring);
				}
			}

			return React.createElement(
				_reactMotion.Motion,
				{ style: springStyle },
				function (style) {
					_this2.lastRenderedStyle = style;
					var children = null;
					if (typeof _this2.props.id === 'string') {
						if (typeof _this2.props.children === 'function') {
							children = _this2.props.children(style[_this2.props.id]);
						} else {
							var translate = { x: 0, y: 0 };
							translate[_OrientationHelpers.orientationProp[_this2.props.orientation]] = style[_this2.props.id];
							children = React.createElement(
								'div',
								{ style: {
										overflow: 'hidden',
										width: '100%',
										height: '100%'
									}
								},
								React.createElement(
									'div',
									{ style: {
											transform: 'translate3d(' + translate.x + 'px, ' + translate.y + 'px, 0px)'
										}
									},
									_this2.props.children
								)
							);
						}
					} else {
						children = _this2.props.children(style);
					}
					if (children instanceof Array) {
						children = React.createElement(
							'div',
							null,
							children
						);
					}
					return React.createElement(
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
}(React.Component), (_applyDecoratedDescriptor(_class.prototype, 'handleEventBegin', [_autobindDecorator2.default], Object.getOwnPropertyDescriptor(_class.prototype, 'handleEventBegin'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'handleEventEnd', [_autobindDecorator2.default], Object.getOwnPropertyDescriptor(_class.prototype, 'handleEventEnd'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, 'handleSwipe', [_autobindDecorator2.default], Object.getOwnPropertyDescriptor(_class.prototype, 'handleSwipe'), _class.prototype)), _class);


Scroller.valueOrArray = function (ReactType) {
	return React.PropTypes.oneOfType([ReactType, React.PropTypes.arrayOf(ReactType)]);
};

Scroller.enumType = function (Enum) {
	return React.PropTypes.oneOf(Object.keys(Enum).map(function (key) {
		return Enum[key];
	}));
};

var propTypes = {
	id: Scroller.valueOrArray(React.PropTypes.string).isRequired,
	orientation: Scroller.enumType(Orientation),
	pagination: Scroller.valueOrArray(Scroller.enumType(Pagination)),
	center: Scroller.valueOrArray(React.PropTypes.bool),
	size: React.PropTypes.shape({
		container: Scroller.valueOrArray(React.PropTypes.number),
		content: Scroller.valueOrArray(React.PropTypes.number)
	}).isRequired,
	page: React.PropTypes.shape({
		size: Scroller.valueOrArray(React.PropTypes.number),
		margin: Scroller.valueOrArray(React.PropTypes.number)
	}),
	multiple: React.PropTypes.shape({
		before: React.PropTypes.number,
		between: React.PropTypes.number,
		size: React.PropTypes.number
	}),
	scale: React.PropTypes.number,
	children: React.PropTypes.oneOfType([React.PropTypes.func, React.PropTypes.node])
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