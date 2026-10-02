import { describe, expect, it } from 'vitest';
import { getFeaturedMovies } from '@/features/movies/application/get-featured-movies';
import type { MovieWithBackdrop } from '@/features/movies/domain/movie';
import {
  aMovie,
  createInMemoryMovieRepository,
} from '@/test/features/movies/in-memory-movie-repository';

const backdrop = { small: 's.jpg', medium: 'm.jpg', large: 'l.jpg' };
const nowPlaying = (id: number, withBackdrop = true): MovieWithBackdrop => ({
  ...aMovie({ id }),
  backdrop: withBackdrop ? backdrop : null,
  overview: '',
});

describe('getFeaturedMovies', () => {
  it('asks for the movies in theatres in the given region', async () => {
    const { repository, calls } = createInMemoryMovieRepository();

    await getFeaturedMovies(repository, 'PE');

    expect(calls.regional).toEqual([{ list: 'nowPlaying', region: 'PE' }]);
  });

  it('keeps only movies with a wide image, at most 6', async () => {
    const movies = [nowPlaying(1, false), ...[2, 3, 4, 5, 6, 7, 8].map((id) => nowPlaying(id))];
    const { repository } = createInMemoryMovieRepository([], { nowPlaying: movies });

    const featured = await getFeaturedMovies(repository, 'PE');

    expect(featured.map((movie) => movie.id)).toEqual([2, 3, 4, 5, 6, 7]);
  });

  it('returns fewer than 6 when the region has fewer, without filling from elsewhere', async () => {
    const { repository, calls } = createInMemoryMovieRepository([], {
      nowPlaying: [nowPlaying(1), nowPlaying(2, false)],
    });

    const featured = await getFeaturedMovies(repository, 'PE');

    expect(featured.map((movie) => movie.id)).toEqual([1]);
    expect(calls.regional).toHaveLength(1);
  });
});
