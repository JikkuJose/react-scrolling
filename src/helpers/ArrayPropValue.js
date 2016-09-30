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

export const propValuesSome = (prop, condition = x => x) => {
  if (prop instanceof Array) {
    return prop.some(condition);
  }
  return condition(prop);
};

export const propValuesEvery = (prop, condition = x => x) => {
  if (prop instanceof Array) {
    return prop.every(condition);
  }
  return condition(prop);
};
