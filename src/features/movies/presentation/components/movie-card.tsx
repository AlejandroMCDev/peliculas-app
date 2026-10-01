import { ViewTransition } from 'react';
import { Link } from 'react-router';
import { Card, CardContent } from '@/shared/ui/card';
import type { Movie } from '../../domain/movie';
import { PosterImage } from './poster-image';
import { RatingBadge } from './rating-badge';

type MovieCardProps = {
  movie: Movie;
  onPrefetch: (id: number) => void;
  sizes?: string;
};

const GRID_SIZES =
  '(min-width: 1280px) 14rem, (min-width: 768px) 25vw, (min-width: 640px) 33vw, 50vw';

export function MovieCard({ movie, onPrefetch, sizes = GRID_SIZES }: MovieCardProps) {
  return (
    <Link
      to={`/movies/${movie.id}`}
      onMouseEnter={() => onPrefetch(movie.id)}
      onFocus={() => onPrefetch(movie.id)}
      className="group block rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/60"
    >
      <Card className="gap-0 py-0 transition-[translate,box-shadow] duration-200 group-hover:-translate-y-1 group-hover:shadow-lg group-hover:shadow-primary/10 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0">
        <div className="relative aspect-2/3 overflow-hidden">
          {/* Same name as the detail poster: React morphs one into the other on navigation. */}
          <ViewTransition name={`poster-${movie.id}`} share="morph" default="none">
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
