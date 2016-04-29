import {
  orientationProp,
} from '../helpers/OrientationHelpers';

export function getVelocityProp(orientation) {
  return `velocity${orientationProp[orientation].toUpperCase()}`;
}

export function getDeltaProp(orientation) {
  return `delta${orientationProp[orientation].toUpperCase()}`;
}

export function getTranslate3D(translate) {
  return `translate3d(${translate.x}px, ${translate.y}px, 0px)`;
}
