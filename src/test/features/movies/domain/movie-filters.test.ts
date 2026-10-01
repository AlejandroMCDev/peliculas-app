import { describe, expect, it } from 'vitest';
import {
  DEFAULT_FILTERS,
  activeFilterCount,
  isSearchMode,
  movieFiltersFromParams,
  movieFiltersToParams,
} from '@/features/movies/domain/movie-filters';

describe('movieFiltersFromParams', () => {
  it('returns the defaults for an empty URL', () => {
    expect(movieFiltersFromParams({})).toEqual(DEFAULT_FILTERS);
  });

  it('reads every filter from the URL', () => {
    const filters = movieFiltersFromParams({
      genres: '28,12',
      cast: '500',
      director: '138',
      from: '1990',
      to: '1999',
      rating: '7.5',
      rmin: '90',
      rmax: '150',
      sort: 'rating',
    });

    expect(filters).toEqual({
      ...DEFAULT_FILTERS,
      genres: [28, 12],
      cast: [500],
      director: 138,
      yearFrom: 1990,
      yearTo: 1999,
      minRating: 7.5,
      runtimeMin: 90,
      runtimeMax: 150,
      sort: 'rating',
    });
  });

  it('falls back to the default for each invalid value', () => {
    const filters = movieFiltersFromParams({
      genres: 'abc,-3,12',
      director: 'x',
      from: '1500',
      rating: '42',
      sort: 'random',
    });

    expect(filters.genres).toEqual([12]);
    expect(filters.director).toBeNull();
    expect(filters.yearFrom).toBeNull();
    expect(filters.minRating).toBe(0);
    expect(filters.sort).toBe('popularity');
  });

  it('swaps a reversed year range', () => {
    const filters = movieFiltersFromParams({ from: '2010', to: '2000' });

    expect([filters.yearFrom, filters.yearTo]).toEqual([2000, 2010]);
  });
});

describe('movieFiltersToParams', () => {
  it('writes nothing for the defaults, so a clean state is a clean URL', () => {
    expect(movieFiltersToParams(DEFAULT_FILTERS)).toEqual({});
  });

  it('round-trips through the URL', () => {
    const filters = {
      ...DEFAULT_FILTERS,
      genres: [18],
      yearTo: 2001,
      minRating: 6,
      sort: 'votes' as const,
    };

    expect(movieFiltersFromParams(movieFiltersToParams(filters))).toEqual(filters);
  });
});

describe('isSearchMode', () => {
  it('is on only when the query has non-blank text', () => {
    expect(isSearchMode({ ...DEFAULT_FILTERS, query: '   ' })).toBe(false);
    expect(isSearchMode({ ...DEFAULT_FILTERS, query: 'Alien' })).toBe(true);
  });
});

describe('activeFilterCount', () => {
  it('counts each genre and person, and each range once', () => {
    const filters = {
      ...DEFAULT_FILTERS,
      genres: [1, 2],
      cast: [3],
      director: 4,
      yearFrom: 2000,
      yearTo: 2010,
      runtimeMax: 120,
      sort: 'rating' as const,
    };

    expect(activeFilterCount(filters)).toBe(6);
  });
});
