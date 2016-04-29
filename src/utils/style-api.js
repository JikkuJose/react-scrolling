import { CONTAINER_STYLE } from './style';
import { orientationSize } from '../helpers/OrientationHelpers';

export function getContainerWithOrientationStyle(orientation, size) {
  return Object.assign({}, CONTAINER_STYLE, {
    [orientationSize[orientation]]: `${size.container}px`,
  });
}
