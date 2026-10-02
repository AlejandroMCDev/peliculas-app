import type { Genre, Movie, MovieDetail, MoviePage, MovieWithBackdrop, Person } from './movie';
import type { MovieFilters } from './movie-filters';

export type Region = string;

export interface MovieRepository {
  discoverMovies(filters: MovieFilters, page: number): Promise<MoviePage>;
  searchMovies(query: string, page: number): Promise<MoviePage>;
  getMovieDetail(id: number): Promise<MovieDetail>;
  listGenres(): Promise<Genre[]>;
  searchPeople(query: string): Promise<Person[]>;
  getPerson(id: number): Promise<Person>;
  listNowPlaying(region: Region): Promise<MovieWithBackdrop[]>;
  listPopular(region: Region): Promise<Movie[]>;
  listUpcoming(region: Region): Promise<Movie[]>;
}
