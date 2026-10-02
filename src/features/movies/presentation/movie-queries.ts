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
import { getFeaturedMovies } from '../application/get-featured-movies';
import { getPerson } from '../application/get-person';
import { listGenres } from '../application/list-genres';
import { listMovieShelf, type ShelfSource } from '../application/list-movie-shelf';
import { MIN_PEOPLE_QUERY_LENGTH, searchPeople } from '../application/search-people';
import type { FeaturedMovie, Movie, MovieDetail, MoviePage, Person } from '../domain/movie';
import type { Region } from '../domain/movie-repository';
import { isSearchMode, type MovieFilters } from '../domain/movie-filters';
import { movieRepository } from '../movies.composition';

const MINUTE = 60_000;
const DAY = 24 * 60 * MINUTE;

export const movieKeys = {
  all: ['movies'] as const,
  lists: () => [...movieKeys.all, 'list'] as const,
  list: (filters: MovieFilters) => [...movieKeys.lists(), cacheKeyFor(filters)] as const,
  details: () => [...movieKeys.all, 'detail'] as const,
  detail: (id: number) => [...movieKeys.details(), id] as const,
  featured: (region: Region) => [...movieKeys.all, 'featured', region] as const,
  shelves: () => [...movieKeys.all, 'shelf'] as const,
  shelf: (source: ShelfSource) => [...movieKeys.shelves(), source] as const,
  genres: () => ['genres'] as const,
  peopleSearch: (query: string) => ['people', 'search', query] as const,
  person: (id: number) => ['people', id] as const,
};

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

export function usePrefetchMovie() {
  const queryClient = useQueryClient();
  return useCallback((id: number) => void queryClient.query(movieDetailOptions(id)), [queryClient]);
}

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
  const shelves = [
    ...queryClient.getQueriesData<Movie[]>({ queryKey: movieKeys.shelves() }),
    ...queryClient.getQueriesData<FeaturedMovie[]>({ queryKey: [...movieKeys.all, 'featured'] }),
  ];
  for (const [, data] of shelves) {
    const found = data?.find((movie) => movie.id === id);
    if (found) return found;
  }
  const details = queryClient.getQueriesData<MovieDetail>({ queryKey: movieKeys.details() });
  for (const [, data] of details) {
    const found = data?.recommendations.find((movie) => movie.id === id);
    if (found) return found;
  }
  return undefined;
}

export function useFeaturedMovies(region: Region) {
  return useQuery({
    queryKey: movieKeys.featured(region),
    queryFn: () => getFeaturedMovies(movieRepository, region),
    staleTime: 60 * MINUTE,
  });
}

export function useMovieShelf(source: ShelfSource) {
  return useQuery({
    queryKey: movieKeys.shelf(source),
    queryFn: () => listMovieShelf(movieRepository, source),
    staleTime: 60 * MINUTE,
  });
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

export function usePeopleNames(ids: number[]): Map<number, string> {
  return useQueries({
    queries: ids.map((id) => ({
      queryKey: movieKeys.person(id),
      queryFn: () => getPerson(movieRepository, id),
      staleTime: DAY,
    })),
    combine: toNameMap,
  });
}

function toNameMap(results: { data?: Person }[]): Map<number, string> {
  return new Map(results.flatMap(({ data }) => (data ? [[data.id, data.name] as const] : [])));
}
