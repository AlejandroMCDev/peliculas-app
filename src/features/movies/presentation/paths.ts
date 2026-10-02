import { DEFAULT_FILTERS, movieFiltersToParams, type MovieFilters } from '../domain/movie-filters';

// The feature's URLs in one place, so a route rename is a one-line change.

export const MOVIES_PATH = '/peliculas';

export function moviePath(id: number) {
  return `${MOVIES_PATH}/${id}`;
}

/** The browse page with some filters applied, e.g. `/peliculas?genres=28`. */
export function browsePath(filters: Partial<MovieFilters> = {}) {
  const query = new URLSearchParams(
    movieFiltersToParams({ ...DEFAULT_FILTERS, ...filters }),
  ).toString();
  return query ? `${MOVIES_PATH}?${query}` : MOVIES_PATH;
}
