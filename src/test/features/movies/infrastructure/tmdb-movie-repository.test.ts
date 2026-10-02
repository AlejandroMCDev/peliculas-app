import { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { describe, expect, it } from 'vitest';
import { DEFAULT_FILTERS } from '@/features/movies/domain/movie-filters';
import { createTmdbClient } from '@/features/movies/infrastructure/tmdb-client';
import {
  createTmdbMovieRepository,
  toDiscoverParams,
} from '@/features/movies/infrastructure/tmdb-movie-repository';
import { isAppError } from '@/shared/lib/errors';

const TODAY = new Date('2026-10-01T12:00:00Z');

type Reply = { status: number; data?: unknown } | 'network-error';

function setup(reply: Reply, token = 'test-token') {
  const requests: InternalAxiosRequestConfig[] = [];
  const client = createTmdbClient(token);
  client.defaults.adapter = async (config) => {
    requests.push(config);
    if (reply === 'network-error') throw new AxiosError('Network Error', 'ERR_NETWORK', config);
    const response: AxiosResponse = {
      data: reply.data,
      status: reply.status,
      statusText: '',
      headers: {},
      config,
    };
    if (reply.status >= 400) {
      throw new AxiosError('Request failed', 'ERR_BAD_REQUEST', config, null, response);
    }
    return response;
  };
  return { repository: createTmdbMovieRepository(client, () => TODAY), requests };
}

const movieDto = {
  id: 348,
  title: 'Alien, el octavo pasajero',
  release_date: '1979-05-25',
  poster_path: '/alien.jpg',
  vote_average: 8.149,
  vote_count: 14000,
};

describe('toDiscoverParams', () => {
  it('maps the filters to TMDB params (genres are joined with AND)', () => {
    const params = toDiscoverParams(
      {
        ...DEFAULT_FILTERS,
        genres: [28, 878],
        cast: [10205],
        director: 578,
        yearFrom: 1979,
        yearTo: 1986,
        minRating: 7,
        runtimeMin: 90,
      },
      2,
      TODAY,
    );

    expect(params).toMatchObject({
      page: 2,
      sort_by: 'popularity.desc',
      with_genres: '28,878',
      with_cast: '10205',
      with_crew: 578,
      'primary_release_date.gte': '1979-01-01',
      'primary_release_date.lte': '1986-12-31',
      'vote_average.gte': 7,
      'vote_count.gte': 200,
      'with_runtime.gte': 90,
      'with_runtime.lte': undefined,
    });
  });

  it('leaves unset filters undefined so axios drops them', () => {
    const params = toDiscoverParams(DEFAULT_FILTERS, 1, TODAY);

    expect(params.with_genres).toBeUndefined();
    expect(params['vote_count.gte']).toBeUndefined();
    expect(params['primary_release_date.lte']).toBeUndefined();
  });

  it('hides unreleased movies when sorting by most recent', () => {
    const params = toDiscoverParams({ ...DEFAULT_FILTERS, sort: 'release' }, 1, TODAY);

    expect(params['primary_release_date.lte']).toBe('2026-10-01');
  });
});

describe('createTmdbMovieRepository', () => {
  it('sends the token, the language and the params, and maps the page', async () => {
    const { repository, requests } = setup({
      status: 200,
      data: { page: 1, total_pages: 900, results: [movieDto] },
    });

    const page = await repository.discoverMovies({ ...DEFAULT_FILTERS, genres: [27] }, 1);

    const request = requests[0];
    expect(request?.url).toBe('/discover/movie');
    expect(request?.headers.Authorization).toBe('Bearer test-token');
    expect(request?.params).toMatchObject({ language: 'es-MX', with_genres: '27' });
    expect(page.totalPages).toBe(500);
    expect(page.movies).toEqual([
      {
        id: 348,
        title: 'Alien, el octavo pasajero',
        year: 1979,
        rating: 8.1,
        voteCount: 14000,
        poster: {
          small: 'https://image.tmdb.org/t/p/w185/alien.jpg',
          medium: 'https://image.tmdb.org/t/p/w342/alien.jpg',
          large: 'https://image.tmdb.org/t/p/w500/alien.jpg',
        },
      },
    ]);
  });

  it('maps a detail: directors, Spanish trailer first, empty money as null', async () => {
    const { repository } = setup({
      status: 200,
      data: {
        ...movieDto,
        overview: 'Una nave recibe una señal…',
        tagline: '',
        runtime: 117,
        genres: [{ id: 27, name: 'Terror' }],
        budget: 11_000_000,
        revenue: 0,
        credits: {
          cast: [
            {
              id: 10205,
              name: 'Sigourney Weaver',
              character: 'Ripley',
              profile_path: null,
              order: 0,
            },
          ],
          crew: [
            { id: 578, name: 'Ridley Scott', job: 'Director' },
            { id: 1, name: 'Dan O’Bannon', job: 'Screenplay' },
          ],
        },
        videos: {
          results: [
            {
              key: 'en-key',
              name: 'Trailer',
              site: 'YouTube',
              type: 'Trailer',
              iso_639_1: 'en',
              official: true,
            },
            {
              key: 'es-key',
              name: 'Tráiler',
              site: 'YouTube',
              type: 'Trailer',
              iso_639_1: 'es',
              official: false,
            },
          ],
        },
        recommendations: { results: [{ ...movieDto, id: 679, title: 'Aliens' }] },
      },
    });

    const detail = await repository.getMovieDetail(348);

    expect(detail.directors).toEqual([{ id: 578, name: 'Ridley Scott' }]);
    expect(detail.trailer).toEqual({ youtubeKey: 'es-key', name: 'Tráiler' });
    expect(detail.tagline).toBeNull();
    expect(detail.budget).toBe(11_000_000);
    expect(detail.revenue).toBeNull();
    expect(detail.cast[0]).toMatchObject({ name: 'Sigourney Weaver', character: 'Ripley' });
    expect(detail.recommendations.map((movie) => movie.title)).toEqual(['Aliens']);
  });

  it('turns a 404 into NOT_FOUND', async () => {
    const { repository } = setup({ status: 404 });

    await expect(repository.getMovieDetail(999)).rejects.toSatisfy((error) =>
      isAppError(error, 'NOT_FOUND'),
    );
  });

  it('turns a 401 into CONFIG (bad token)', async () => {
    const { repository } = setup({ status: 401 });

    await expect(repository.listGenres()).rejects.toSatisfy((error) => isAppError(error, 'CONFIG'));
  });

  it('turns a missing response into NETWORK', async () => {
    const { repository } = setup('network-error');

    await expect(repository.listGenres()).rejects.toSatisfy((error) =>
      isAppError(error, 'NETWORK'),
    );
  });

  it('rejects a response with an unexpected shape as UNEXPECTED', async () => {
    const { repository } = setup({ status: 200, data: { genres: 'nope' } });

    await expect(repository.listGenres()).rejects.toSatisfy((error) =>
      isAppError(error, 'UNEXPECTED'),
    );
  });

  it('fails with CONFIG before any request when the token is missing', async () => {
    const { repository, requests } = setup({ status: 200, data: {} }, '');

    await expect(repository.listGenres()).rejects.toSatisfy((error) => isAppError(error, 'CONFIG'));
    expect(requests).toEqual([]);
  });
});

describe('regional lists', () => {
  const page = { page: 1, total_pages: 1, results: [{ ...movieDto, backdrop_path: '/wide.jpg' }] };

  it('reads what is in theatres in the region, with the wide image', async () => {
    const { repository, requests } = setup({ status: 200, data: page });

    const [movie] = await repository.listNowPlaying('PE');

    expect(requests[0]?.url).toBe('/movie/now_playing');
    expect(requests[0]?.params).toMatchObject({ region: 'PE' });
    expect(movie?.backdrop?.large).toBe('https://image.tmdb.org/t/p/w1280/wide.jpg');
  });

  it('lists popular movies already released in theatres in the region', async () => {
    const { repository, requests } = setup({ status: 200, data: page });

    await repository.listPopular('PE');

    expect(requests[0]?.params).toMatchObject({
      region: 'PE',
      with_release_type: '2|3',
      sort_by: 'popularity.desc',
      'release_date.lte': '2026-10-01',
    });
  });

  it('lists upcoming movies from tomorrow on in the region', async () => {
    const { repository, requests } = setup({ status: 200, data: page });

    await repository.listUpcoming('PE');

    expect(requests[0]?.params).toMatchObject({
      region: 'PE',
      with_release_type: '2|3',
      'release_date.gte': '2026-10-02',
    });
  });
});
