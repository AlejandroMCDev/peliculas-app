import type { MoviePage } from '../domain/movie';
import { isSearchMode, type MovieFilters } from '../domain/movie-filters';
import type { MovieRepository } from '../domain/movie-repository';

export function browseMovies(
  repository: MovieRepository,
  filters: MovieFilters,
  page = 1,
): Promise<MoviePage> {
  return isSearchMode(filters)
    ? repository.searchMovies(filters.query.trim(), page)
    : repository.discoverMovies(filters, page);
}
