import * as Pagination from '../consts/Pagination';
import * as Springs from '../consts/Springs';

export function getSpringByPagination(pagination) {
  switch (pagination) {
    case Pagination.Single:
    case Pagination.First:
      return Springs.Move;
    case Pagination.Multiple:
      return Springs.Bounce;
    default:
      return Springs.Move;
  }
}

export function getAdjustedSpring(oldPosition, newPosition, spring) {
  if (oldPosition !== newPosition) {
    return Springs.Bounce;
  }
  return spring;
}
