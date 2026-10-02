import { z } from 'zod';

export const MOVIE_SORTS = ['popularity', 'rating', 'release', 'votes'] as const;
export type MovieSort = (typeof MOVIE_SORTS)[number];

export const YEAR_MIN = 1900;
export const YEAR_MAX = 2100;
export const RUNTIME_MAX = 240;
export const RATING_MAX = 9;

export type MovieFilters = {
  query: string;
  genres: number[];
  cast: number[];
  director: number | null;
  yearFrom: number | null;
  yearTo: number | null;
  minRating: number;
  runtimeMin: number | null;
  runtimeMax: number | null;
  sort: MovieSort;
};

export const DEFAULT_FILTERS: MovieFilters = {
  query: '',
  genres: [],
  cast: [],
  director: null,
  yearFrom: null,
  yearTo: null,
  minRating: 0,
  runtimeMin: null,
  runtimeMax: null,
  sort: 'popularity',
};

const idList = z
  .string()
  .transform((value) =>
    value
      .split(',')
      .map(Number)
      .filter((id) => Number.isInteger(id) && id > 0),
  )
  .catch([]);

const intInRange = (min: number, max: number) =>
  z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .pipe(z.number().int().min(min).max(max))
    .nullable()
    .catch(null);

const paramsSchema = z.object({
  q: z.string().trim().max(100).catch(''),
  genres: idList,
  cast: idList,
  director: intInRange(1, Number.MAX_SAFE_INTEGER),
  from: intInRange(YEAR_MIN, YEAR_MAX),
  to: intInRange(YEAR_MIN, YEAR_MAX),
  rating: z.coerce.number().min(0).max(RATING_MAX).catch(0),
  rmin: intInRange(0, RUNTIME_MAX),
  rmax: intInRange(0, RUNTIME_MAX),
  sort: z.enum(MOVIE_SORTS).catch('popularity'),
});

export type FilterParams = Record<string, string | undefined>;

export function movieFiltersFromParams(params: FilterParams): MovieFilters {
  const p = paramsSchema.parse(params);
  const [yearFrom, yearTo] = orderRange(p.from, p.to);
  const [runtimeMin, runtimeMax] = orderRange(p.rmin, p.rmax);
  return {
    query: p.q,
    genres: p.genres,
    cast: p.cast,
    director: p.director,
    yearFrom,
    yearTo,
    minRating: p.rating,
    runtimeMin,
    runtimeMax,
    sort: p.sort,
  };
}

export function movieFiltersToParams(filters: MovieFilters): Record<string, string> {
  const params: Record<string, string> = {};
  if (filters.query.trim()) params.q = filters.query.trim();
  if (filters.genres.length) params.genres = filters.genres.join(',');
  if (filters.cast.length) params.cast = filters.cast.join(',');
  if (filters.director !== null) params.director = String(filters.director);
  if (filters.yearFrom !== null) params.from = String(filters.yearFrom);
  if (filters.yearTo !== null) params.to = String(filters.yearTo);
  if (filters.minRating > 0) params.rating = String(filters.minRating);
  if (filters.runtimeMin !== null) params.rmin = String(filters.runtimeMin);
  if (filters.runtimeMax !== null) params.rmax = String(filters.runtimeMax);
  if (filters.sort !== DEFAULT_FILTERS.sort) params.sort = filters.sort;
  return params;
}

function orderRange(a: number | null, b: number | null): [number | null, number | null] {
  return a !== null && b !== null && a > b ? [b, a] : [a, b];
}

export function isSearchMode(filters: MovieFilters): boolean {
  return filters.query.trim().length > 0;
}

export function activeFilterCount(filters: MovieFilters): number {
  return (
    filters.genres.length +
    filters.cast.length +
    (filters.director !== null ? 1 : 0) +
    (filters.yearFrom !== null || filters.yearTo !== null ? 1 : 0) +
    (filters.minRating > 0 ? 1 : 0) +
    (filters.runtimeMin !== null || filters.runtimeMax !== null ? 1 : 0)
  );
}
