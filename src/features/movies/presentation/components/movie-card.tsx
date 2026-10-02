import { ViewTransition } from 'react';
import { Link } from 'react-router';
import { Card, CardContent } from '@/shared/ui/card';
import type { Movie } from '../../domain/movie';
import { morphKey, setMorphSource, useIsMorphSource } from '../morph-source';
import { moviePath } from '../paths';
import { PosterImage } from './poster-image';
import { RatingBadge } from './rating-badge';

type MovieCardProps = {
  movie: Movie;
  /** Where the card lives ("browse", "action"…): tells apart the same movie in two lists. */
  scope: string;
  onPrefetch: (id: number) => void;
  sizes?: string;
};

const GRID_SIZES =
  '(min-width: 1280px) 14rem, (min-width: 768px) 25vw, (min-width: 640px) 33vw, 50vw';

export function MovieCard({ movie, scope, onPrefetch, sizes = GRID_SIZES }: MovieCardProps) {
  const key = morphKey(scope, movie.id);
  const isMorphSource = useIsMorphSource(key);

  return (
    <Link
      to={moviePath(movie.id)}
      onClick={() => setMorphSource(key)}
      onMouseEnter={() => onPrefetch(movie.id)}
      onFocus={() => onPrefetch(movie.id)}
      className="group block rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/60"
    >
      <Card className="gap-0 py-0 transition-[translate,box-shadow] duration-200 group-hover:-translate-y-1 group-hover:shadow-lg group-hover:shadow-primary/10 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0">
        <div className="relative aspect-2/3 overflow-hidden">
          {/* Same name as the detail poster: React morphs one into the other on navigation.
              Only the clicked card gets it, so the name stays unique (see morph-source.ts). */}
          <ViewTransition
            name={isMorphSource ? `poster-${movie.id}` : undefined}
            share="morph"
            default="none"
          >
            <PosterImage image={movie.poster} alt={`Póster de ${movie.title}`} sizes={sizes} />
          </ViewTransition>
          <RatingBadge
            rating={movie.rating}
            voteCount={movie.voteCount}
            className="absolute top-2 right-2"
          />
        </div>
        <CardContent className="space-y-0.5 px-3 py-2.5">
          <h3 className="line-clamp-1 font-semibold" title={movie.title}>
            {movie.title}
          </h3>
          <p className="text-sm text-muted-foreground tabular-nums">{movie.year ?? 'Sin fecha'}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
