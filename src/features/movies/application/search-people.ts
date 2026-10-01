import type { Person } from '../domain/movie';
import type { MovieRepository } from '../domain/movie-repository';

export const MIN_PEOPLE_QUERY_LENGTH = 2;

/** One letter matches thousands of people: wait for a meaningful query before calling the API. */
export function searchPeople(repository: MovieRepository, query: string): Promise<Person[]> {
  const trimmed = query.trim();
  if (trimmed.length < MIN_PEOPLE_QUERY_LENGTH) return Promise.resolve([]);
  return repository.searchPeople(trimmed);
}
