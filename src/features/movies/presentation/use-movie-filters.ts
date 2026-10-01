import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import {
  movieFiltersFromParams,
  movieFiltersToParams,
  type MovieFilters,
} from '../domain/movie-filters';

/**
 * The filters live in the URL: shareable, they survive a reload, and coming back from a detail
 * page restores them. The URL is the single source of truth; components never copy it to state.
 */
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
        // replace: tweaking a filter should not add a history entry for every click.
        { replace: true },
      ),
    [setSearchParams],
  );

  const resetFilters = useCallback(() => setSearchParams({}, { replace: true }), [setSearchParams]);

  return { filters, updateFilters, resetFilters };
}
