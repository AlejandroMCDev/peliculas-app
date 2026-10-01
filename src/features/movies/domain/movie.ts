// Entities: the shape the whole app works with. TMDB's raw shapes (DTOs) never leave infrastructure.

/** Ready-to-use image URLs in three widths, so the UI can build a responsive `srcset`. */
export type ImageSet = { small: string; medium: string; large: string };

export type Genre = { id: number; name: string };

export type Person = {
  id: number;
  name: string;
  photo: ImageSet | null;
  /** e.g. "Acting", "Directing" */
  department: string | null;
};

export type CastMember = { id: number; name: string; character: string; photo: ImageSet | null };

export type Movie = {
  id: number;
  title: string;
  year: number | null;
  /** 0–10 */
  rating: number;
  voteCount: number;
  poster: ImageSet | null;
};

export type MoviePage = { movies: Movie[]; page: number; totalPages: number };

/**
 * TMDB pages are computed on the fly: when popularity shifts between two requests, a movie can
 * appear on two consecutive pages. Keep the first occurrence so each movie is listed once.
 */
export function uniqueMovies(movies: readonly Movie[]): Movie[] {
  const seen = new Set<number>();
  return movies.filter((movie) => !seen.has(movie.id) && seen.add(movie.id));
}

export type Trailer = { youtubeKey: string; name: string };

export type MovieDetail = Movie & {
  overview: string;
  tagline: string | null;
  backdrop: ImageSet | null;
  /** minutes */
  runtime: number | null;
  genres: Genre[];
  directors: Pick<Person, 'id' | 'name'>[];
  cast: CastMember[];
  trailer: Trailer | null;
  /** USD; null when TMDB has no data */
  budget: number | null;
  revenue: number | null;
  recommendations: Movie[];
};
