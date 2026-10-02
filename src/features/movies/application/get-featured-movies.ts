import { pickFeatured, type FeaturedMovie } from '../domain/movie';
import type { MovieRepository, Region } from '../domain/movie-repository';

export const FEATURED_COUNT = 6;

export async function getFeaturedMovies(
  repository: MovieRepository,
  region: Region,
): Promise<FeaturedMovie[]> {
  return pickFeatured(await repository.listNowPlaying(region), FEATURED_COUNT);
}
