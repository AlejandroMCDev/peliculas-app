import type { Movie, MoviePage, Person } from '@/features/movies/domain/movie';
import type { MovieFilters } from '@/features/movies/domain/movie-filters';
import type { MovieRepository } from '@/features/movies/domain/movie-repository';
import { AppError } from '@/shared/lib/errors';

export function aMovie(overrides: Partial<Movie> = {}): Movie {
  return {
    id: 1,
    title: 'Alien',
    year: 1979,
    rating: 8.1,
    voteCount: 14000,
    poster: null,
    ...overrides,
  };
}

/** Test double for the port: records the calls it gets and answers from fixed data. */
export function createInMemoryMovieRepository(people: Person[] = []) {
  const calls = {
    discover: [] as { filters: MovieFilters; page: number }[],
    search: [] as { query: string; page: number }[],
    searchPeople: [] as string[],
  };
  const page = (movies: Movie[], number: number): MoviePage => ({
    movies,
    page: number,
    totalPages: 3,
  });

  const repository: MovieRepository = {
    async discoverMovies(filters, number) {
      calls.discover.push({ filters, page: number });
      return page([aMovie({ id: 10, title: 'Discovered' })], number);
    },
    async searchMovies(query, number) {
      calls.search.push({ query, page: number });
      return page([aMovie({ id: 20, title: 'Found' })], number);
    },
    async getMovieDetail() {
      throw new AppError('NOT_FOUND', 'not used in these tests');
    },
    async listGenres() {
      return [
        { id: 2, name: 'Western' },
        { id: 1, name: 'Acción' },
        { id: 3, name: 'Ciencia ficción' },
      ];
    },
    async searchPeople(query) {
      calls.searchPeople.push(query);
      return people;
    },
    async getPerson(id) {
      const person = people.find((item) => item.id === id);
      if (!person) throw new AppError('NOT_FOUND', `person ${id}`);
      return person;
    },
  };

  return { repository, calls };
}
