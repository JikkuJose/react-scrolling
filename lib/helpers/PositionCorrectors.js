'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.pageNumberForPosition = exports.velocityPositionCorrection = exports.paginationCorrection = exports.outOfTheBoxCorrection = undefined;

var _config = require('../config');

var Config = _interopRequireWildcard(_config);

var _ArrayPropValue = require('./ArrayPropValue');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var outOfTheBoxCorrection = exports.outOfTheBoxCorrection = function outOfTheBoxCorrection(position, scroller, _ref) {
	var id = _ref.id;
	var size = _ref.size;
	var center = _ref.center;

	var container = (0, _ArrayPropValue.getPropValueForScroller)(scroller, id, size.container);
	var content = (0, _ArrayPropValue.getPropValueForScroller)(scroller, id, size.content);
	var containerOrContent = container < content ? container : content;

	var leftEdge = 0;
	var rightEdge = containerOrContent - content;

	if ((0, _ArrayPropValue.getPropValueForScroller)(scroller, id, center) && container > content) {
		var shift = (container - content) / 2;
		leftEdge += shift;
		rightEdge += shift;
	}

	if (position > leftEdge) {
		return leftEdge;
	}
	if (position < rightEdge) {
		return rightEdge;
	}

	return position;
};

var pagePosition = function pagePosition(pageNumber, pageSize, pageMargin, containerSize) {
	return pageSize / 2 - (pageNumber + 1) * (pageSize + pageMargin) + containerSize / 2;
};

var pageNumber = function pageNumber(position, pageSize, pageMargin, containerSize) {
	return (-position + containerSize / 2 - pageMargin - pageSize / 2) / (pageSize + pageMargin);
};

var paginationCorrection = exports.paginationCorrection = function paginationCorrection(position, scroller, _ref2) {
	var id = _ref2.id;
	var size = _ref2.size;
	var page = _ref2.page;
	var direction = arguments.length <= 3 || arguments[3] === undefined ? 0 : arguments[3];
	var prevSinglePage = arguments.length <= 4 || arguments[4] === undefined ? undefined : arguments[4];
	var onlyFirst = arguments.length <= 5 || arguments[5] === undefined ? false : arguments[5];

	var pageSize = (0, _ArrayPropValue.getPropValueForScroller)(scroller, id, page.size);
	var pageMargin = (0, _ArrayPropValue.getPropValueForScroller)(scroller, id, page.margin);
	var containerSize = (0, _ArrayPropValue.getPropValueForScroller)(scroller, id, size.container);

	if (onlyFirst) {
		if (-position < pageMargin + pageSize / 2) {
			return 0;
		}
		if (-position < pageSize + 2 * pageMargin) {
			return -(pageSize + 2 * pageMargin);
		}
		return position;
	}

	var k = (-position + containerSize / 2 - pageMargin - pageSize / 2) / (pageSize + pageMargin);
	var n = Math.round(k + direction * 0.5);

	if (prevSinglePage !== undefined) {
		if (n > prevSinglePage + 1) {
			n = prevSinglePage + 1;
		}
		if (n < prevSinglePage - 1) {
			n = prevSinglePage - 1;
		}
	}

	return pagePosition(n, pageSize, pageMargin, containerSize);
};

var velocityPositionCorrection = exports.velocityPositionCorrection = function velocityPositionCorrection(position, scroller, velocity) {
	var distance = velocity * velocity / (2 * Config.ACCELERATION_INSIDE_SCROLLER);
	var direction = Math.sign(velocity);

	return position - direction * distance;
};

var pageNumberForPosition = exports.pageNumberForPosition = function pageNumberForPosition(position, scroller, _ref3, margin) {
	var id = _ref3.id;
	var size = _ref3.size;
	var page = _ref3.page;

	var pageSize = (0, _ArrayPropValue.getPropValueForScroller)(scroller, id, page.size);
	var pageMargin = margin === undefined ? (0, _ArrayPropValue.getPropValueForScroller)(scroller, id, page.margin) : margin;
	var containerSize = (0, _ArrayPropValue.getPropValueForScroller)(scroller, id, size.container);

	return Math.round(pageNumber(position, pageSize, pageMargin, containerSize));
};