import { describe, expect, it } from 'vitest';
import { SHELF_SIZE, listMovieShelf } from '@/features/movies/application/list-movie-shelf';
import { DEFAULT_FILTERS } from '@/features/movies/domain/movie-filters';
import {
  aMovie,
  createInMemoryMovieRepository,
} from '@/test/features/movies/in-memory-movie-repository';

const movies = (count: number) => Array.from({ length: count }, (_, i) => aMovie({ id: i + 1 }));

describe('listMovieShelf', () => {
  it('reads popular and upcoming movies for the region', async () => {
    const { repository, calls } = createInMemoryMovieRepository();

    await listMovieShelf(repository, { kind: 'popular', region: 'PE' });
    await listMovieShelf(repository, { kind: 'upcoming', region: 'PE' });

    expect(calls.regional).toEqual([
      { list: 'popular', region: 'PE' },
      { list: 'upcoming', region: 'PE' },
    ]);
  });

  it('discovers with the section filters on top of the defaults', async () => {
    const { repository, calls } = createInMemoryMovieRepository();

    await listMovieShelf(repository, { kind: 'discover', filters: { genres: [28] } });

    expect(calls.discover).toEqual([{ filters: { ...DEFAULT_FILTERS, genres: [28] }, page: 1 }]);
  });

  it(`shows at most ${SHELF_SIZE} movies, each once`, async () => {
    const { repository } = createInMemoryMovieRepository([], {
      popular: [aMovie({ id: 1 }), aMovie({ id: 1 }), ...movies(20)],
    });

    const shelf = await listMovieShelf(repository, { kind: 'popular', region: 'PE' });

    expect(shelf).toHaveLength(SHELF_SIZE);
    expect(new Set(shelf.map((movie) => movie.id)).size).toBe(SHELF_SIZE);
  });
});
