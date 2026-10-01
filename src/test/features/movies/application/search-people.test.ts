import { describe, expect, it } from 'vitest';
import { searchPeople } from '@/features/movies/application/search-people';
import { createInMemoryMovieRepository } from '@/test/features/movies/in-memory-movie-repository';

const sigourney = { id: 10205, name: 'Sigourney Weaver', photo: null, department: 'Acting' };

describe('searchPeople', () => {
  it('does not call TMDB for fewer than 2 letters', async () => {
    const { repository, calls } = createInMemoryMovieRepository([sigourney]);

    await expect(searchPeople(repository, ' s ')).resolves.toEqual([]);
    expect(calls.searchPeople).toEqual([]);
  });

  it('searches with the trimmed text', async () => {
    const { repository, calls } = createInMemoryMovieRepository([sigourney]);

    await expect(searchPeople(repository, ' sigo ')).resolves.toEqual([sigourney]);
    expect(calls.searchPeople).toEqual(['sigo']);
  });
});
