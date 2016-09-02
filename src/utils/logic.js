import { spring } from 'react-motion';
import { orientationProp } from '../helpers/OrientationHelpers';

export function getSpringStyleForScroller(scrollerState) {
  if (scrollerState.spring !== null) {
    return spring(
      scrollerState.position,
      scrollerState.spring
    );
  }
  return scrollerState.position;
}

export function getPositionAndSpring(newPosition, springValue) {
  return {
    position: newPosition,
    spring: springValue,
  };
}

export function getEmptyVelocity() {
  return {
    velocityX: 0,
    velocityY: 0,
  };
}

export function correctLoopPosition(position, contentSize, contentAutoSize) {
  const contentSize2 = (contentAutoSize === undefined) ? contentSize : contentAutoSize;
  let pos = position % contentSize2;
  if (pos > 0) {
    pos -= contentSize2;
  }
  return pos;
}

export function closestLoopPosition(oldPosition, newPosition, contentSize, contentAutoSize) {
  const contentSize2 = (contentAutoSize === undefined) ? contentSize : contentAutoSize;
  const newPosition2 = correctLoopPosition(newPosition, contentSize, contentAutoSize);
  const oldFrame = Math.ceil(oldPosition / contentSize2);
  const prevFrame = ((oldFrame - 1) * contentSize2) + newPosition2;
  const currFrame = (oldFrame * contentSize2) + newPosition2;
  const nextFrame = ((oldFrame + 1) * contentSize2) + newPosition2;
  let min = prevFrame;
  if (Math.abs(currFrame - oldPosition) < Math.abs(min - oldPosition)) {
    min = currFrame;
  }
  if (Math.abs(nextFrame - oldPosition) < Math.abs(min - oldPosition)) {
    min = nextFrame;
  }
  return min;
}

export function setOrientationPos(translate, orientation, position) {
  return Object.assign({}, translate, {
    [orientationProp[orientation]]: position,
  });
}

export function getCoordinatesByOrientation(coordinates, orientation) {
  return coordinates[orientationProp[orientation]];
}
