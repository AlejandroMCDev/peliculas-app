import { DEFAULT_FILTERS, movieFiltersToParams, type MovieFilters } from '../domain/movie-filters';

export const MOVIES_PATH = '/peliculas';

export function moviePath(id: number) {
  return `${MOVIES_PATH}/${id}`;
}

export function browsePath(filters: Partial<MovieFilters> = {}) {
  const query = new URLSearchParams(
    movieFiltersToParams({ ...DEFAULT_FILTERS, ...filters }),
  ).toString();
  return query ? `${MOVIES_PATH}?${query}` : MOVIES_PATH;
}
