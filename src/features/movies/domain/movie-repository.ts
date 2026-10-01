import type { Genre, MovieDetail, MoviePage, Person } from './movie';
import type { MovieFilters } from './movie-filters';

// The port: what the application needs, not how TMDB provides it.
export interface MovieRepository {
  discoverMovies(filters: MovieFilters, page: number): Promise<MoviePage>;
  searchMovies(query: string, page: number): Promise<MoviePage>;
  getMovieDetail(id: number): Promise<MovieDetail>;
  listGenres(): Promise<Genre[]>;
  searchPeople(query: string): Promise<Person[]>;
  getPerson(id: number): Promise<Person>;
}
