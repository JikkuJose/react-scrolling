import * as Config from '../config';
import { getPropValueForScroller } from './ArrayPropValue';

export const outOfTheBoxCorrection = (
    position,
    scroller,
    { id, size, center },
    contentAutoSize) => {
  const container = getPropValueForScroller(scroller, id, size.container);
  let content = getPropValueForScroller(scroller, id, size.content);
  if (content === undefined) {
    content = contentAutoSize;
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

const pagePosition = (pageNumber, pageSize, pageMargin, containerSize) =>
  pageSize / 2 - (pageNumber + 1) * (pageSize + pageMargin) + containerSize / 2;

const pageNumber = (position, pageSize, pageMargin, containerSize) =>
  (-position + containerSize / 2 - pageMargin - pageSize / 2) / (pageSize + pageMargin);

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

  if (onlyFirst) {
    if (-position < pageMargin + pageSize / 2) {
      return 0;
    }
    if (-position < pageSize + 2 * pageMargin) {
      return -(pageSize + 2 * pageMargin);
    }
    return position;
  }

  const k = (-position + containerSize / 2 - pageMargin - pageSize / 2) / (pageSize + pageMargin);
  let n = Math.round(k + direction * 0.5);

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
  const distance = velocity * velocity / (2 * Config.ACCELERATION_INSIDE_SCROLLER);
  const direction = Math.sign(velocity);

  return position - direction * distance;
};

export const pagePositionForScroller = (pageNum, scroller, { id, size, page }, margin) => {
  const pageSize = getPropValueForScroller(scroller, id, page.size);
  const pageMargin = margin === undefined
      ? getPropValueForScroller(scroller, id, page.margin)
      : margin;
  const containerSize = getPropValueForScroller(scroller, id, size.container);
  return pagePosition(pageNum, pageSize, pageMargin, containerSize);
};

export const pageNumberForPosition = (position, scroller, { id, size, page }, margin) => {
  const pageSize = getPropValueForScroller(scroller, id, page.size);
  const pageMargin = margin === undefined
    ? getPropValueForScroller(scroller, id, page.margin)
    : margin;
  const containerSize = getPropValueForScroller(scroller, id, size.container);

  return Math.round(pageNumber(position, pageSize, pageMargin, containerSize));
};
