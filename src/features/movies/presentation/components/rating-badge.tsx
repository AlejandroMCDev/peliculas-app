import { Star } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Badge } from '@/shared/ui/badge';
import { formatRating } from '../format';

type RatingBadgeProps = { rating: number; voteCount: number; className?: string };

export function RatingBadge({ rating, voteCount, className }: RatingBadgeProps) {
  const hasRating = voteCount > 0;

  return (
    <Badge
      variant="secondary"
      className={cn('gap-1 bg-background/85 tabular-nums backdrop-blur-sm', className)}
      aria-label={hasRating ? `Calificación ${formatRating(rating)} de 10` : 'Sin calificación'}
    >
      <Star className="fill-primary text-primary" aria-hidden />
      {hasRating ? formatRating(rating) : '—'}
    </Badge>
  );
}
