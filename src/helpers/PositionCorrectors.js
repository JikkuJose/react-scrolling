import * as Config from '../config';
import { getPropValueForScroller } from './ArrayPropValue';

export const outOfTheBoxCorrection = (
  position,
  scroller,
  { id, size, center },
  contentAutoSize
) => {
  const container = getPropValueForScroller(scroller, id, size.container);
  let content = contentAutoSize;
  if (content === undefined) {
    content = getPropValueForScroller(scroller, id, size.content);
  }
  const containerOrContent = container < content ? container : content;
  let leftEdge = 0;
  let rightEdge = containerOrContent - content;
  if (getPropValueForScroller(scroller, id, center) && container > content) {
    const shift = (container - content) / 2;
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

const pagePosition = (pageNumber, pageSize, pageMargin, containerSize) => {
  const halfPageSize = pageSize / 2;
  const secondPart = (pageNumber + 1) * (pageSize + pageMargin);
  const halfContainerSize = containerSize / 2;
  return (halfPageSize - secondPart) + halfContainerSize;
};

const pageNumber = (position, pageSize, pageMargin, containerSize) => {
  const halfPageSize = pageSize / 2;
  const halfContainerSize = containerSize / 2;
  const pageSizeWithMargin = pageSize + pageMargin;
  return (halfContainerSize - position - pageMargin - halfPageSize) / pageSizeWithMargin;
};

export const paginationCorrection = (
  position,
  scroller,
  { id, size, page },
  direction = 0,
  prevSinglePage = undefined,
  onlyFirst = false
) => {
  const pageSize = getPropValueForScroller(scroller, id, page.size);
  const pageMargin = getPropValueForScroller(scroller, id, page.margin);
  const containerSize = getPropValueForScroller(scroller, id, size.container);
  const halfPageSize = pageSize / 2;
  const halfContainerSize = containerSize / 2;
  if (onlyFirst) {
    if (-position < pageMargin + halfPageSize) {
      return 0;
    }
    const doubleMargin = 2 * pageMargin;
    if (-position < pageSize + doubleMargin) {
      return -(pageSize + doubleMargin);
    }
    return position;
  }
  const pageSizeWithMargin = pageSize + pageMargin;
  const k = (halfContainerSize - position - pageMargin - halfPageSize) / pageSizeWithMargin;
  const haldDirection = direction * 0.5;
  let n = Math.round(k + haldDirection);
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

export const velocityPositionCorrection = (position, scroller, velocity) => {
  const doubleVelocity = velocity * velocity;
  const distance = doubleVelocity / (2 * Config.ACCELERATION_INSIDE_SCROLLER);
  const direction = Math.sign(velocity);
  return position - (direction * distance);
};

export const pagePositionForScroller = (
  pageNum,
  scroller,
  { id, size, center, page },
  margin,
  contentAutoSize,
  needCorrection
) => {
  const pageSize = getPropValueForScroller(scroller, id, page.size);
  const pageMargin = margin === undefined
    ? getPropValueForScroller(scroller, id, page.margin)
    : margin;
  const containerSize = getPropValueForScroller(scroller, id, size.container);
  const pagePos = pagePosition(pageNum, pageSize, pageMargin, containerSize);
  const correctedPos = needCorrection ? outOfTheBoxCorrection(
    pagePos,
    scroller,
    { id, size, center },
    contentAutoSize
  ) : pagePos;
  return correctedPos;
};

export const pageNumberForPosition = (position, scroller, { id, size, page }, margin) => {
  const pageSize = getPropValueForScroller(scroller, id, page.size);
  const pageMargin = margin === undefined
    ? getPropValueForScroller(scroller, id, page.margin)
    : margin;
  const containerSize = getPropValueForScroller(scroller, id, size.container);
  return Math.round(pageNumber(position, pageSize, pageMargin, containerSize));
};
