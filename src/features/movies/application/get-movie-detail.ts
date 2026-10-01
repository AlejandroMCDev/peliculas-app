import { AppError } from '@/shared/lib/errors';
import type { MovieDetail } from '../domain/movie';
import type { MovieRepository } from '../domain/movie-repository';

export function getMovieDetail(repository: MovieRepository, id: number): Promise<MovieDetail> {
  if (!Number.isInteger(id) || id <= 0) {
    return Promise.reject(new AppError('NOT_FOUND', `Invalid movie id: ${id}`));
  }
  return repository.getMovieDetail(id);
}
