import { useEffect } from 'react';
import { useInView } from '@/shared/hooks/use-in-view';
import { cn } from '@/shared/lib/utils';
import type { Movie } from '../../domain/movie';
import { MovieCard } from './movie-card';
import { MovieCardSkeleton } from './movie-card-skeleton';

type MovieGridProps = {
  movies: Movie[];
  /** First load: only skeletons. */
  isLoading: boolean;
  /** Next page on its way: skeletons appended at the end. */
  isLoadingMore: boolean;
  /** Showing the previous filter's results while the new ones load. */
  isStale: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onPrefetch: (id: number) => void;
};

const GRID = 'grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5';
const skeletons = (count: number) =>
  Array.from({ length: count }, (_, index) => (
    <li key={`skeleton-${index}`}>
      <MovieCardSkeleton />
    </li>
  ));

export function MovieGrid({
  movies,
  isLoading,
  isLoadingMore,
  isStale,
  hasMore,
  onLoadMore,
  onPrefetch,
}: MovieGridProps) {
  const [sentinelRef, sentinelInView] = useInView<HTMLDivElement>();

  // Infinite scroll: when the sentinel below the grid gets close to the viewport, load the next page.
  useEffect(() => {
    if (sentinelInView && hasMore && !isLoadingMore && !isStale) onLoadMore();
  }, [sentinelInView, hasMore, isLoadingMore, isStale, onLoadMore]);

  if (isLoading) {
    return (
      <ul className={GRID} aria-busy="true" aria-label="Cargando películas">
        {skeletons(10)}
      </ul>
    );
  }

  return (
    <div className="space-y-6">
      <ul
        className={cn(GRID, 'transition-opacity duration-200', isStale && 'opacity-50')}
        aria-busy={isStale || isLoadingMore}
      >
        {movies.map((movie) => (
          <li key={movie.id}>
            <MovieCard movie={movie} onPrefetch={onPrefetch} />
          </li>
        ))}
        {isLoadingMore && skeletons(5)}
      </ul>
      <div ref={sentinelRef} aria-hidden className="h-px" />
      {!hasMore && movies.length > 0 && (
        <p className="text-center text-sm text-muted-foreground">
          Has llegado al final de la lista.
        </p>
      )}
    </div>
  );
}
