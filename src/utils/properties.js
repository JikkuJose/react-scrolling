import {
  orientationProp,
} from '../helpers/OrientationHelpers';

export function getVelocityProp(orientation) {
  return `velocity${orientationProp[orientation].toUpperCase()}`;
}

export function getDeltaProp(orientation) {
  return `delta${orientationProp[orientation].toUpperCase()}`;
}
