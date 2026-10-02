import type { ShelfSource } from '../application/list-movie-shelf';
import type { MovieFilters } from '../domain/movie-filters';
import type { Region } from '../domain/movie-repository';

/** Country for theatre listings, popularity and upcoming releases on the home page. */
export const HOME_REGION: Region = 'PE';

// TMDB genre ids (stable across languages).
const GENRE = { action: 28, mystery: 9648, horror: 27, scienceFiction: 878 } as const;

export type HomeShelf = {
  /** Also the morph scope of its cards. */
  id: string;
  title: string;
  source: ShelfSource;
  /** Filters for the "Ver todas" link; omitted when /peliculas cannot express the section. */
  seeAll?: Partial<MovieFilters>;
  emptyText: string;
};

const genreShelf = (id: string, title: string, genre: number): HomeShelf => ({
  id,
  title,
  source: { kind: 'discover', filters: { genres: [genre] } },
  seeAll: { genres: [genre] },
  emptyText: 'No encontramos películas de este género.',
});

/** The home sections, in display order. Adding one is adding an entry here. */
export const HOME_SHELVES: HomeShelf[] = [
  {
    id: 'popular-pe',
    title: 'Populares en Perú',
    source: { kind: 'popular', region: HOME_REGION },
    emptyText: 'TMDB no tiene datos de popularidad para Perú en este momento.',
  },
  {
    id: 'upcoming-pe',
    title: 'Próximos estrenos',
    source: { kind: 'upcoming', region: HOME_REGION },
    emptyText: 'No hay próximos estrenos registrados para Perú.',
  },
  genreShelf('action', 'Acción', GENRE.action),
  genreShelf('mystery', 'Misterio', GENRE.mystery),
  genreShelf('horror', 'Terror', GENRE.horror),
  genreShelf('science-fiction', 'Ciencia ficción', GENRE.scienceFiction),
  {
    id: 'top-rated',
    title: 'Mejor valoradas',
    source: { kind: 'discover', filters: { sort: 'rating' } },
    seeAll: { sort: 'rating' },
    emptyText: 'No encontramos películas valoradas.',
  },
];
