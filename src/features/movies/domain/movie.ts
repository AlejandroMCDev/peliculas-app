export type ImageSet = { small: string; medium: string; large: string };

export type Genre = { id: number; name: string };

export type Person = {
  id: number;
  name: string;
  photo: ImageSet | null;
  department: string | null;
};

export type CastMember = { id: number; name: string; character: string; photo: ImageSet | null };

export type Movie = {
  id: number;
  title: string;
  year: number | null;
  rating: number;
  voteCount: number;
  poster: ImageSet | null;
};

export type MoviePage = { movies: Movie[]; page: number; totalPages: number };

export function uniqueMovies(movies: readonly Movie[]): Movie[] {
  const seen = new Set<number>();
  return movies.filter((movie) => !seen.has(movie.id) && seen.add(movie.id));
}

export type MovieWithBackdrop = Movie & { backdrop: ImageSet | null; overview: string };

export type FeaturedMovie = Movie & { backdrop: ImageSet; overview: string };

export function pickFeatured(movies: readonly MovieWithBackdrop[], count: number): FeaturedMovie[] {
  return movies
    .flatMap(({ backdrop, ...movie }) => (backdrop ? [{ ...movie, backdrop }] : []))
    .slice(0, count);
}

export type Trailer = { youtubeKey: string; name: string };

export type MovieDetail = Movie & {
  overview: string;
  tagline: string | null;
  backdrop: ImageSet | null;
  runtime: number | null;
  genres: Genre[];
  directors: Pick<Person, 'id' | 'name'>[];
  cast: CastMember[];
  trailer: Trailer | null;
  budget: number | null;
  revenue: number | null;
  recommendations: Movie[];
};
