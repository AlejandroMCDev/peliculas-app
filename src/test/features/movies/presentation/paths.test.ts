import { describe, expect, it } from 'vitest';
import { browsePath, moviePath } from '@/features/movies/presentation/paths';

describe('paths', () => {
  it('builds the detail URL', () => {
    expect(moviePath(550)).toBe('/peliculas/550');
  });

  it('builds the browse URL with only the given filters', () => {
    expect(browsePath()).toBe('/peliculas');
    expect(browsePath({ genres: [9648] })).toBe('/peliculas?genres=9648');
    expect(browsePath({ sort: 'rating' })).toBe('/peliculas?sort=rating');
  });
});
