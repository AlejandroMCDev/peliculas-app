import { ArrowRight, RotateCw } from 'lucide-react';
import { Link } from 'react-router';
import { describeError } from '@/shared/lib/error-message';
import { Button } from '@/shared/ui/button';
import type { Movie } from '../../domain/movie';
import { MovieCarousel, MovieCarouselSkeleton } from './movie-carousel';

type MovieShelfProps = {
  id: string;
  title: string;
  /** Link to the full, filterable list; omitted when /peliculas cannot express this section. */
  seeAllHref?: string;
  movies: Movie[] | undefined;
  isLoading: boolean;
  error: unknown;
  emptyText: string;
  onRetry: () => void;
  onPrefetch: (id: number) => void;
};

/** A home section: title, optional "Ver todas" link and a carousel of movies. */
export function MovieShelf({
  id,
  title,
  seeAllHref,
  movies,
  isLoading,
  error,
  emptyText,
  onRetry,
  onPrefetch,
}: MovieShelfProps) {
  const headingId = `shelf-${id}`;

  return (
    <section aria-labelledby={headingId} className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <h2
          id={headingId}
          className="font-display text-2xl font-medium tracking-wide uppercase sm:text-3xl"
        >
          {title}
        </h2>
        {seeAllHref && (
          <Button variant="ghost" size="sm" asChild className="shrink-0">
            <Link to={seeAllHref} aria-label={`Ver todas: ${title}`}>
              Ver todas
              <ArrowRight />
            </Link>
          </Button>
        )}
      </div>

      {error && !movies ? (
        <div
          role="alert"
          className="flex flex-wrap items-center gap-3 rounded-xl border border-dashed p-4 text-sm"
        >
          <span className="text-muted-foreground">{describeError(error).title}</span>
          {describeError(error).canRetry && (
            <Button variant="outline" size="sm" onClick={onRetry}>
              <RotateCw />
              Reintentar
            </Button>
          )}
        </div>
      ) : isLoading || !movies ? (
        <MovieCarouselSkeleton />
      ) : movies.length === 0 ? (
        <p className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
          {emptyText}
        </p>
      ) : (
        <MovieCarousel movies={movies} label={title} scope={id} onPrefetch={onPrefetch} />
      )}
    </section>
  );
}
