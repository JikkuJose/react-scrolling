import { getPropValueForScroller } from './ArrayPropValue';
import * as Pagination from '../consts/Pagination';
import * as Springs from '../consts/Springs';
import { getSpringStyleForScroller, getPositionAndSpring } from '../utils/logic';

export const getInitialPosition = (scrollerId, props) => {
  const pagination = getPropValueForScroller(scrollerId, props.id, props.pagination);
  if (pagination === Pagination.First) {
    const pageSize = getPropValueForScroller(scrollerId, props.id, props.page.size);
    const pageMargin = getPropValueForScroller(scrollerId, props.id, props.page.margin);
    return - (pageSize + 2 * pageMargin);
  }
  return 0;
};

export const getInitialScrollerState = (scrollerId, props) => ({
  position: getInitialPosition(scrollerId, props),
  spring: Springs.Normal,
});

export const getInitialState = (props) => {
  const scrollers = {};
  if (typeof props.id === 'string') {
    scrollers[props.id] = getInitialScrollerState(props.id, props);
  } else {
    for (const id of props.id) {
      scrollers[id] = getInitialScrollerState(id, props);
    }
  }
  return { scrollers };
};

export const foreachScroller = (state, callback) => {
  const { scrollers } = state;
  for (const scrollerId in scrollers) {
    if (scrollers.hasOwnProperty(scrollerId)) {
      callback(scrollerId);
    }
  }
};

export const getSpringStyle = (state) => {
  const springStyle = {};
  const { scrollers } = state;
  foreachScroller(state, (scrollerId) => {
    springStyle[scrollerId] = getSpringStyleForScroller(scrollers[scrollerId]);
  });
  return springStyle;
};

export const scrollerExists = (state, scrollerId) => (
  scrollerId in state.scrollers
);

export const moveScrollerNewState = (oldState, scrollerId, newPosition, springValue) => ({
  scrollers: Object.assign({}, oldState.scrollers, {
    [scrollerId]: getPositionAndSpring(newPosition, springValue),
  }),
});

export const getScrollerPosition = (state, scrollerId) =>
  state.scrollers[scrollerId].position;

export const getScrollerSpring = (state, scrollerId) =>
  state.scrollers[scrollerId].spring;

export const getAllScrollerPositions = (state) => {
  const positions = {};
  foreachScroller(state, (scrollerId) => {
    positions[scrollerId] = getScrollerPosition(state, scrollerId);
  });
  return positions;
};
