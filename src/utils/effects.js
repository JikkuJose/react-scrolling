import * as Pagination from '../consts/Pagination';
import * as Springs from '../consts/Springs';

export function getSpringByPagination(pagination) {
  switch (pagination) {
    case Pagination.Single:
      return Springs.Move;
    case Pagination.First:
    case Pagination.Multiple:
      return Springs.Bounce;
    default:
      return Springs.Move;
  }
}

export function getAdjustedSpring(newPosition, finalPosition, spring) {
  if (newPosition !== finalPosition) {
    return Springs.Bounce;
  }
  return spring;
}
