
const scrollerLocks = {};

export const setScrollerLock = (orientation, scrollerId) => {
  scrollerLocks[orientation] = scrollerId;
};

export const getScrollerLock = (orientation) => (
  scrollerLocks[orientation]
);

export const emptyScrollerLock = (orientation) => {
  scrollerLocks[orientation] = undefined;
};

export const isScrollerLocked = (orientation) => (
  scrollerLocks[orientation] !== undefined
);
