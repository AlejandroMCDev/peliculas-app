import type { Genre, Movie, MovieDetail, MoviePage, MovieWithBackdrop, Person } from './movie';
import type { MovieFilters } from './movie-filters';

/** ISO 3166-1 country code, e.g. "PE": release dates and theatres are per country. */
export type Region = string;

// The port: what the application needs, not how TMDB provides it.
export interface MovieRepository {
  discoverMovies(filters: MovieFilters, page: number): Promise<MoviePage>;
  searchMovies(query: string, page: number): Promise<MoviePage>;
  getMovieDetail(id: number): Promise<MovieDetail>;
  listGenres(): Promise<Genre[]>;
  searchPeople(query: string): Promise<Person[]>;
  getPerson(id: number): Promise<Person>;
  /** In theatres now in the region. */
  listNowPlaying(region: Region): Promise<MovieWithBackdrop[]>;
  /** Most popular movies already released in the region. */
  listPopular(region: Region): Promise<Movie[]>;
  /** Most anticipated movies not yet released in the region. */
  listUpcoming(region: Region): Promise<Movie[]>;
}
