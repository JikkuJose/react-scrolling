import { orientationProp } from './OrientationHelpers';

export const scrollerOnPoint = (point, { id, multiple, orientation }) => {
    if (typeof id === 'string') {
        return id;
    }
    const reverseOrientation = (orientation + 1) % 2;
    const reverseValue = point[orientationProp[reverseOrientation]];
    const index = Math.floor(
        (reverseValue - multiple.before) /
        (multiple.size + multiple.between));
    const delta = (reverseValue - multiple.before) % (multiple.size + multiple.between);
    if (delta > multiple.size) {
        return undefined;
    }
    return id[index];
};
