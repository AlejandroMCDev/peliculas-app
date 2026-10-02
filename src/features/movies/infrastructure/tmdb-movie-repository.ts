import type { AxiosInstance } from 'axios';
import { z } from 'zod';
import { AppError } from '@/shared/lib/errors';
import type { MoviePage } from '../domain/movie';
import type { MovieFilters, MovieSort } from '../domain/movie-filters';
import type { MovieRepository, Region } from '../domain/movie-repository';
import {
  genreListDtoSchema,
  movieDetailDtoSchema,
  movieDtoSchema,
  pageDtoSchema,
  personDtoSchema,
} from './tmdb-dtos';
import { toMovie, toMovieDetail, toMovieWithBackdrop, toPerson } from './tmdb-mappers';

const SORT_PARAM: Record<MovieSort, string> = {
  popularity: 'popularity.desc',
  rating: 'vote_average.desc',
  release: 'primary_release_date.desc',
  votes: 'vote_count.desc',
};

const MIN_VOTES_FOR_RATING = 200;
const MAX_PAGES = 500;
const PEOPLE_LIMIT = 8;

const moviePageDtoSchema = pageDtoSchema(movieDtoSchema);
const personPageDtoSchema = pageDtoSchema(personDtoSchema);

export function toDiscoverParams(filters: MovieFilters, page: number, today: Date) {
  const usesRating = filters.sort === 'rating' || filters.minRating > 0;
  const join = (ids: number[]) => (ids.length ? ids.join(',') : undefined);
  return {
    page,
    include_adult: false,
    sort_by: SORT_PARAM[filters.sort],
    with_genres: join(filters.genres),
    with_cast: join(filters.cast),
    with_crew: filters.director ?? undefined,
    'primary_release_date.gte': filters.yearFrom ? `${filters.yearFrom}-01-01` : undefined,
    'primary_release_date.lte': filters.yearTo
      ? `${filters.yearTo}-12-31`
      : filters.sort === 'release'
        ? isoDate(today)
        : undefined,
    'vote_average.gte': filters.minRating > 0 ? filters.minRating : undefined,
    'vote_count.gte': usesRating ? MIN_VOTES_FOR_RATING : undefined,
    'with_runtime.gte': filters.runtimeMin ?? undefined,
    'with_runtime.lte': filters.runtimeMax ?? undefined,
  };
}

function regionalParams(region: Region) {
  return { region, with_release_type: '2|3', include_adult: false, page: 1 };
}

const isoDate = (date: Date) => date.toISOString().slice(0, 10);
const addDays = (date: Date, days: number) => new Date(date.getTime() + days * 86_400_000);

export function createTmdbMovieRepository(
  client: AxiosInstance,
  now: () => Date = () => new Date(),
): MovieRepository {
  async function get<T>(schema: z.ZodType<T>, url: string, params?: object): Promise<T> {
    const { data } = await client.get<unknown>(url, { params });
    const parsed = schema.safeParse(data);
    if (!parsed.success) {
      throw new AppError('UNEXPECTED', `Unexpected TMDB response for ${url}`, {
        cause: parsed.error,
      });
    }
    return parsed.data;
  }

  async function getMoviePage(url: string, params: object): Promise<MoviePage> {
    const dto = await get(moviePageDtoSchema, url, params);
    return {
      movies: dto.results.map(toMovie),
      page: dto.page,
      totalPages: Math.min(dto.total_pages, MAX_PAGES),
    };
  }

  return {
    discoverMovies: (filters, page) =>
      getMoviePage('/discover/movie', toDiscoverParams(filters, page, now())),

    searchMovies: (query, page) =>
      getMoviePage('/search/movie', { query, page, include_adult: false }),

    async getMovieDetail(id) {
      const dto = await get(movieDetailDtoSchema, `/movie/${id}`, {
        append_to_response: 'credits,videos,recommendations',
        include_video_language: 'es,en',
      });
      return toMovieDetail(dto);
    },

    async listGenres() {
      return (await get(genreListDtoSchema, '/genre/movie/list')).genres;
    },

    async searchPeople(query) {
      const dto = await get(personPageDtoSchema, '/search/person', { query, include_adult: false });
      return dto.results.slice(0, PEOPLE_LIMIT).map(toPerson);
    },

    async getPerson(id) {
      return toPerson(await get(personDtoSchema, `/person/${id}`));
    },

    async listNowPlaying(region) {
      const dto = await get(moviePageDtoSchema, '/movie/now_playing', { region, page: 1 });
      return dto.results.map(toMovieWithBackdrop);
    },

    async listPopular(region) {
      const dto = await get(moviePageDtoSchema, '/discover/movie', {
        ...regionalParams(region),
        sort_by: 'popularity.desc',
        'release_date.lte': isoDate(now()),
      });
      return dto.results.map(toMovie);
    },

    async listUpcoming(region) {
      const dto = await get(moviePageDtoSchema, '/discover/movie', {
        ...regionalParams(region),
        sort_by: 'popularity.desc',
        'release_date.gte': isoDate(addDays(now(), 1)),
      });
      return dto.results.map(toMovie);
    },
  };
}
