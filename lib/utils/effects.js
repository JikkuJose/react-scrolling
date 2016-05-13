'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getSpringByPagination = getSpringByPagination;
exports.getAdjustedSpring = getAdjustedSpring;

var _Pagination = require('../consts/Pagination');

var Pagination = _interopRequireWildcard(_Pagination);

var _Springs = require('../consts/Springs');

var Springs = _interopRequireWildcard(_Springs);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function getSpringByPagination(pagination) {
  switch (pagination) {
    case Pagination.Single:
    case Pagination.First:
      return Springs.Move;
    case Pagination.Multiple:
      return Springs.Bounce;
    default:
      return Springs.Move;
  }
}

function getAdjustedSpring(oldPosition, newPosition, spring) {
  if (oldPosition !== newPosition) {
    return Springs.Bounce;
  }
  return spring;
}