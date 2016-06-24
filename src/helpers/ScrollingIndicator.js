
let scrolling = false;

// should be true even after scrolling is finished
// to check inside click event
export const isScrolling = () =>
  scrolling;

export const startScrolling = () => {
  scrolling = true;
};

export const resetScrolling = () => {
  scrolling = false;
};
