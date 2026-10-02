import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import {
  movieFiltersFromParams,
  movieFiltersToParams,
  type MovieFilters,
} from '../domain/movie-filters';

export function useMovieFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo(
    () => movieFiltersFromParams(Object.fromEntries(searchParams)),
    [searchParams],
  );

  const updateFilters = useCallback(
    (patch: Partial<MovieFilters>) =>
      setSearchParams(
        (current) =>
          movieFiltersToParams({
            ...movieFiltersFromParams(Object.fromEntries(current)),
            ...patch,
          }),
        { replace: true },
      ),
    [setSearchParams],
  );

  const resetFilters = useCallback(() => setSearchParams({}, { replace: true }), [setSearchParams]);

  return { filters, updateFilters, resetFilters };
}
