
const eventCoordinates = (e, scale, windowWidth) => {
  const shift = (windowWidth / 2) * (1 - scale);
  if (e.touches && e.touches.length > 0) {
    const firstTouch = e.touches[0];
    return {
      x: (firstTouch.clientX - shift) / scale,
      y: firstTouch.clientY / scale,
    };
  }
  return {
    x: (e.clientX - shift) / scale,
    y: e.clientY / scale,
  };
};

export default eventCoordinates;
