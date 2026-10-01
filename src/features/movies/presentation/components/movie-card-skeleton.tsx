import { Card, CardContent } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';

// Same box model as MovieCard, so the grid does not jump when real cards replace skeletons.
export function MovieCardSkeleton() {
  return (
    <Card className="gap-0 py-0" aria-hidden>
      <Skeleton className="aspect-2/3 rounded-none" />
      <CardContent className="space-y-2 px-3 py-3">
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-3.5 w-1/3" />
      </CardContent>
    </Card>
  );
}
