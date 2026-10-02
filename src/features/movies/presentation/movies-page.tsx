import { SearchX } from 'lucide-react';
import { useMemo } from 'react';
import { ErrorState } from '@/shared/components/error-state';
import { Button } from '@/shared/ui/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/shared/ui/empty';
import { uniqueMovies } from '../domain/movie';
import { activeFilterCount, isSearchMode } from '../domain/movie-filters';
import { ActiveFilters } from './components/active-filters';
import { FiltersPanel } from './components/filters-panel';
import { FiltersSheet } from './components/filters-sheet';
import { MovieGrid } from './components/movie-grid';
import { SearchInput } from './components/search-input';
import { SortSelect } from './components/sort-select';
import { useGenres, useMovieList, usePeopleNames, usePrefetchMovie } from './movie-queries';
import { useMovieFilters } from './use-movie-filters';

export function MoviesPage() {
  const { filters, updateFilters, resetFilters } = useMovieFilters();
  const list = useMovieList(filters);
  const genres = useGenres();
  const prefetchMovie = usePrefetchMovie();

  const personIds = useMemo(
    () => (filters.director === null ? filters.cast : [...filters.cast, filters.director]),
    [filters.cast, filters.director],
  );
  const peopleNames = usePeopleNames(personIds);

  const searching = isSearchMode(filters);
  const movies = useMemo(
    () => uniqueMovies(list.data?.pages.flatMap((page) => page.movies) ?? []),
    [list.data],
  );

  const panel = (
    <FiltersPanel
      filters={filters}
      genres={genres.isError ? [] : genres.data}
      peopleNames={peopleNames}
      disabled={searching}
      onChange={updateFilters}
    />
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:grid lg:grid-cols-[16rem_1fr] lg:gap-10">
      <title>
        {searching ? `“${filters.query}” · Cartelera` : 'Explorar películas · Cartelera'}
      </title>

      <aside className="hidden lg:block" aria-label="Filtros">
        <div className="sticky top-20 max-h-[calc(100dvh-6rem)] overflow-y-auto pr-2 pb-6">
          {panel}
        </div>
      </aside>

      <section className="min-w-0 space-y-5" aria-labelledby="movies-title">
        <div className="space-y-1">
          <h1
            id="movies-title"
            className="font-display text-4xl font-semibold tracking-tight uppercase sm:text-5xl"
          >
            {searching ? 'Resultados' : 'Explorar películas'}
          </h1>
          <p className="text-muted-foreground">
            {searching
              ? `Búsqueda por título: “${filters.query}”.`
              : 'Filtra por género, reparto, director, año, calificación o duración.'}
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="flex-1">
            <SearchInput value={filters.query} onChange={(query) => updateFilters({ query })} />
          </div>
          <div className="flex gap-2">
            <FiltersSheet activeCount={activeFilterCount(filters)}>{panel}</FiltersSheet>
            <SortSelect
              value={filters.sort}
              disabled={searching}
              onChange={(sort) => updateFilters({ sort })}
            />
          </div>
        </div>

        {searching && (
          <p className="rounded-lg border border-dashed px-3 py-2 text-sm text-muted-foreground">
            TMDB no permite combinar la búsqueda por título con filtros: bórrala para volver a
            filtrar.
          </p>
        )}

        <ActiveFilters
          filters={filters}
          genres={genres.data ?? []}
          peopleNames={peopleNames}
          onChange={updateFilters}
          onReset={resetFilters}
        />

        {list.isError && movies.length === 0 ? (
          <ErrorState error={list.error} onRetry={() => void list.refetch()} />
        ) : !list.isPending && movies.length === 0 ? (
          <NoResults onReset={resetFilters} />
        ) : (
          <MovieGrid
            movies={movies}
            isLoading={list.isPending}
            isLoadingMore={list.isFetchingNextPage}
            isStale={list.isPlaceholderData}
            hasMore={list.hasNextPage}
            onLoadMore={() => void list.fetchNextPage({ cancelRefetch: false })}
            onPrefetch={prefetchMovie}
          />
        )}
      </section>
    </div>
  );
}

function NoResults({ onReset }: { onReset: () => void }) {
  return (
    <Empty className="border border-dashed">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <SearchX />
        </EmptyMedia>
        <EmptyTitle>No hay películas con estos filtros</EmptyTitle>
        <EmptyDescription>
          Prueba a quitar algún filtro o a ampliar el rango de años.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button variant="outline" onClick={onReset}>
          Limpiar filtros
        </Button>
      </EmptyContent>
    </Empty>
  );
}
