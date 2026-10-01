// Public API of the movies feature: the only module other code may import.
export type { Movie } from './domain/movie';
export { MoviesPage } from './presentation/movies-page';

/** The detail page is split into its own chunk: it downloads when a movie is first opened. */
export async function loadMovieDetailRoute() {
  const { MovieDetailPage } = await import('./presentation/movie-detail-page');
  return { Component: MovieDetailPage };
}
