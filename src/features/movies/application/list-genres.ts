import type { Genre } from '../domain/movie';
import type { MovieRepository } from '../domain/movie-repository';

export async function listGenres(repository: MovieRepository): Promise<Genre[]> {
  const genres = await repository.listGenres();
  return [...genres].sort((a, b) => a.name.localeCompare(b.name, 'es'));
}
