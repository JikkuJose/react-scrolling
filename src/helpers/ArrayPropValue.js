export const getPropValueForScroller = (scroller, id, prop) => {
  if (typeof id === 'string') {
    if (id === scroller) {
      return prop;
    }
    return undefined;
  }
  const index = id.indexOf(scroller);
  if (index >= 0) {
    if (prop instanceof Array) {
      return prop[index];
    }
    return prop;
  }
  return undefined;
};
