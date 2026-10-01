import type { Person } from '../domain/movie';
import type { MovieRepository } from '../domain/movie-repository';

export function getPerson(repository: MovieRepository, id: number): Promise<Person> {
  return repository.getPerson(id);
}
