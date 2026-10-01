import {
  keepPreviousData,
  queryOptions,
  useInfiniteQuery,
  useQueries,
  useQuery,
  useQueryClient,
  type InfiniteData,
  type QueryClient,
} from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { browseMovies } from '../application/browse-movies';
import { getMovieDetail } from '../application/get-movie-detail';
import { getPerson } from '../application/get-person';
import { listGenres } from '../application/list-genres';
import { MIN_PEOPLE_QUERY_LENGTH, searchPeople } from '../application/search-people';
import type { Movie, MovieDetail, MoviePage, Person } from '../domain/movie';
import { isSearchMode, type MovieFilters } from '../domain/movie-filters';
import { movieRepository } from '../movies.composition';

const MINUTE = 60_000;
const DAY = 24 * 60 * MINUTE;

// Query key factory: one place defines every cache key, so invalidation and lookups never drift.
export const movieKeys = {
  all: ['movies'] as const,
  lists: () => [...movieKeys.all, 'list'] as const,
  list: (filters: MovieFilters) => [...movieKeys.lists(), cacheKeyFor(filters)] as const,
  details: () => [...movieKeys.all, 'detail'] as const,
  detail: (id: number) => [...movieKeys.details(), id] as const,
  genres: () => ['genres'] as const,
  peopleSearch: (query: string) => ['people', 'search', query] as const,
  person: (id: number) => ['people', id] as const,
};

/** In search mode only the text matters: ignoring the other filters avoids pointless cache misses. */
function cacheKeyFor(filters: MovieFilters) {
  return isSearchMode(filters) ? { query: filters.query.trim() } : { ...filters, query: '' };
}

export function useMovieList(filters: MovieFilters) {
  return useInfiniteQuery({
    queryKey: movieKeys.list(filters),
    queryFn: ({ pageParam }) => browseMovies(movieRepository, filters, pageParam),
    initialPageParam: 1,
    getNextPageParam: (last: MoviePage) =>
      last.page < last.totalPages ? last.page + 1 : undefined,
    // While a new filter loads, keep showing the previous results (dimmed) instead of a blank grid.
    placeholderData: keepPreviousData,
  });
}

const movieDetailOptions = (id: number) =>
  queryOptions({
    queryKey: movieKeys.detail(id),
    queryFn: () => getMovieDetail(movieRepository, id),
    staleTime: 30 * MINUTE,
    enabled: id > 0,
  });

export function useMovieDetail(id: number) {
  return useQuery(movieDetailOptions(id));
}

/** Starts loading a detail before the click (hover/focus), so the page often opens fully loaded. */
export function usePrefetchMovie() {
  const queryClient = useQueryClient();
  return useCallback(
    (id: number) => void queryClient.prefetchQuery(movieDetailOptions(id)),
    [queryClient],
  );
}

/**
 * The movie as already seen in a list (or in another detail's recommendations). The detail page
 * paints its poster immediately with it, which is what lets the card → detail morph happen.
 */
export function useCachedMovie(id: number): Movie | undefined {
  const queryClient = useQueryClient();
  return useMemo(() => findCachedMovie(queryClient, id), [queryClient, id]);
}

function findCachedMovie(queryClient: QueryClient, id: number): Movie | undefined {
  const lists = queryClient.getQueriesData<InfiniteData<MoviePage>>({
    queryKey: movieKeys.lists(),
  });
  for (const [, data] of lists) {
    const found = data?.pages.flatMap((page) => page.movies).find((movie) => movie.id === id);
    if (found) return found;
  }
  const details = queryClient.getQueriesData<MovieDetail>({ queryKey: movieKeys.details() });
  for (const [, data] of details) {
    const found = data?.recommendations.find((movie) => movie.id === id);
    if (found) return found;
  }
  return undefined;
}

export function useGenres() {
  return useQuery({
    queryKey: movieKeys.genres(),
    queryFn: () => listGenres(movieRepository),
    staleTime: DAY,
    gcTime: DAY,
  });
}

export function usePeopleSearch(query: string) {
  const trimmed = query.trim();
  return useQuery({
    queryKey: movieKeys.peopleSearch(trimmed),
    queryFn: () => searchPeople(movieRepository, trimmed),
    enabled: trimmed.length >= MIN_PEOPLE_QUERY_LENGTH,
    staleTime: 10 * MINUTE,
    placeholderData: keepPreviousData,
  });
}

/** Names for the people ids stored in the URL (chips and selected lists). Cached for a day. */
export function usePeopleNames(ids: number[]): Map<number, string> {
  return useQueries({
    queries: ids.map((id) => ({
      queryKey: movieKeys.person(id),
      queryFn: () => getPerson(movieRepository, id),
      staleTime: DAY,
    })),
    // `combine` is memoized by TanStack Query: the Map only changes when a result changes.
    combine: toNameMap,
  });
}

function toNameMap(results: { data?: Person }[]): Map<number, string> {
  return new Map(results.flatMap(({ data }) => (data ? [[data.id, data.name] as const] : [])));
}
