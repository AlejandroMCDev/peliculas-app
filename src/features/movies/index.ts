export type { Movie } from './domain/movie';
export { HomePage } from './presentation/home-page';
export { MoviesPage } from './presentation/movies-page';
export { MOVIES_PATH } from './presentation/paths';

export async function loadMovieDetailRoute() {
  const { MovieDetailPage } = await import('./presentation/movie-detail-page');
  return { Component: MovieDetailPage };
}
