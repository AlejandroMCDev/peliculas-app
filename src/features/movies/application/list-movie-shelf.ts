import { uniqueMovies, type Movie } from '../domain/movie';
import { DEFAULT_FILTERS, type MovieFilters } from '../domain/movie-filters';
import type { MovieRepository, Region } from '../domain/movie-repository';

/** How many movies a home section shows. */
export const SHELF_SIZE = 12;

/** Where a home section's movies come from. */
export type ShelfSource =
  | { kind: 'popular'; region: Region }
  | { kind: 'upcoming'; region: Region }
  | { kind: 'discover'; filters: Partial<MovieFilters> };

/** One home section ("shelf"): a short list of movies from one source. */
export async function listMovieShelf(
  repository: MovieRepository,
  source: ShelfSource,
): Promise<Movie[]> {
  const movies =
    source.kind === 'popular'
      ? await repository.listPopular(source.region)
      : source.kind === 'upcoming'
        ? await repository.listUpcoming(source.region)
        : (await repository.discoverMovies({ ...DEFAULT_FILTERS, ...source.filters }, 1)).movies;
  return uniqueMovies(movies).slice(0, SHELF_SIZE);
}
