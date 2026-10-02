import { env } from '@/shared/config/env';
import type { MovieRepository } from './domain/movie-repository';
import { createTmdbClient } from './infrastructure/tmdb-client';
import { createTmdbMovieRepository } from './infrastructure/tmdb-movie-repository';

export const movieRepository: MovieRepository = createTmdbMovieRepository(
  createTmdbClient(env.tmdbToken),
);
