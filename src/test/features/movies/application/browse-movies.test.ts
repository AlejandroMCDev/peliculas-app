import { describe, expect, it } from 'vitest';
import { browseMovies } from '@/features/movies/application/browse-movies';
import { DEFAULT_FILTERS } from '@/features/movies/domain/movie-filters';
import { createInMemoryMovieRepository } from '@/test/features/movies/in-memory-movie-repository';

describe('browseMovies', () => {
  it('discovers with the filters when there is no title search', async () => {
    const { repository, calls } = createInMemoryMovieRepository();
    const filters = { ...DEFAULT_FILTERS, genres: [28] };

    const result = await browseMovies(repository, filters, 2);

    expect(calls.discover).toEqual([{ filters, page: 2 }]);
    expect(calls.search).toEqual([]);
    expect(result.movies[0]?.title).toBe('Discovered');
  });

  it('searches by the trimmed title and ignores the other filters', async () => {
    const { repository, calls } = createInMemoryMovieRepository();

    await browseMovies(repository, { ...DEFAULT_FILTERS, query: '  Alien ', genres: [28] });

    expect(calls.search).toEqual([{ query: 'Alien', page: 1 }]);
    expect(calls.discover).toEqual([]);
  });
});
