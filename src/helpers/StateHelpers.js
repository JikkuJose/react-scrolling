import { getPropValueForScroller } from './ArrayPropValue';
import * as Pagination from '../consts/Pagination';
import { getSpringStyleForScroller, getPositionAndSpring } from '../utils/logic';

export const getInitialPosition = (scrollerId, props) => {
  const pagination = getPropValueForScroller(scrollerId, props.id, props.pagination);
  if (pagination === Pagination.First) {
    const pageSize = getPropValueForScroller(scrollerId, props.id, props.page.size);
    const pageMargin = getPropValueForScroller(scrollerId, props.id, props.page.margin);
    return -(pageSize + (2 * pageMargin));
  }
  return 0;
};

export const getInitialScrollerState = (scrollerId, props) => ({
  position: getInitialPosition(scrollerId, props),
  spring: null,
});

export const getInitialState = (props) => {
  const scrollerIds = [];
  const scrollers = [];
  if (typeof props.id === 'string') {
    scrollerIds.push(props.id);
    scrollers.push(getInitialScrollerState(props.id, props));
  } else {
    for (const id of props.id) {
      scrollerIds.push(id);
      scrollers.push(getInitialScrollerState(id, props));
    }
  }
  return { scrollerIds, scrollers };
};

export const foreachScroller = (state, callback) => {
  const { scrollerIds, scrollers } = state;
  scrollerIds.forEach((scrollerId, i) => {
    callback(scrollerId, scrollers[i]);
  });
};

export const getSpringStyle = (state) => {
  const springStyle = {};
  foreachScroller(state, (scrollerId, scroller) => {
    springStyle[scrollerId] = getSpringStyleForScroller(scroller);
  });
  return springStyle;
};

export const scrollerExists = (state, scrollerId) => (
  state.scrollerIds.indexOf(scrollerId) >= 0
);

export const moveScrollerNewPartialState = (oldState, scrollerId, newPosition, springValue) => {
  const { scrollerIds, scrollers } = oldState;
  const newScrollers = [...scrollers];
  const index = scrollerIds.indexOf(scrollerId);
  newScrollers[index] = getPositionAndSpring(newPosition, springValue);
  return {
    scrollers: newScrollers,
  };
};

export const getScroller = (state, scrollerId) => {
  const { scrollerIds, scrollers } = state;
  const index = scrollerIds.indexOf(scrollerId);
  return scrollers[index];
};

export const getScrollerPosition = (state, scrollerId) => (
  getScroller(state, scrollerId).position
);

export const getScrollerSpring = (state, scrollerId) => (
  getScroller(state, scrollerId).spring
);

export const getAllScrollerPositions = (state) => {
  const positions = {};
  foreachScroller(state, (scrollerId, scroller) => {
    positions[scrollerId] = scroller.position;
  });
  return positions;
};
