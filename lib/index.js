'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Pagination = exports.Orientation = exports.Scroller = undefined;

var _component = require('./component');

var _component2 = _interopRequireDefault(_component);

var _Orientation = require('./consts/Orientation');

var Orientation = _interopRequireWildcard(_Orientation);

var _Pagination = require('./consts/Pagination');

var Pagination = _interopRequireWildcard(_Pagination);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.Scroller = _component2.default;
exports.Orientation = Orientation;
exports.Pagination = Pagination;