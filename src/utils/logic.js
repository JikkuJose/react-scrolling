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
  const contentSize2 = (contentSize === undefined) ? contentAutoSize : contentSize;
  let pos = position % contentSize2;
  if (pos > 0) {
    pos -= contentSize2;
  }
  return pos;
}

export function setOrientationPos(translate, orientation, position) {
  return Object.assign({}, translate, {
    [orientationProp[orientation]]: position,
  });
}

export function getCoordinatesByOrientation(coordinates, orientation) {
  return coordinates[orientationProp[orientation]];
}
