import { UserRound } from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/shared/ui/scroll-area';
import { Skeleton } from '@/shared/ui/skeleton';
import type { CastMember } from '../../domain/movie';

type CastListProps = { cast: CastMember[] };

export function CastList({ cast }: CastListProps) {
  if (cast.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">TMDB no tiene el reparto de esta película.</p>
    );
  }

  return (
    <ScrollArea className="-mx-1 w-[calc(100%+0.5rem)]">
      <ul className="flex gap-3 px-1 pb-4">
        {cast.map((member) => (
          <li key={`${member.id}-${member.character}`} className="w-28 shrink-0 sm:w-32">
            <div className="aspect-2/3 overflow-hidden rounded-lg bg-muted">
              {member.photo ? (
                <img
                  src={member.photo.medium}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="size-full object-cover"
                />
              ) : (
                <div className="flex size-full items-center justify-center text-muted-foreground">
                  <UserRound className="size-8" aria-hidden />
                </div>
              )}
            </div>
            <p className="mt-2 line-clamp-2 text-sm leading-tight font-semibold">{member.name}</p>
            {member.character && (
              <p className="line-clamp-2 text-xs text-muted-foreground">{member.character}</p>
            )}
          </li>
        ))}
      </ul>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}

export function CastListSkeleton() {
  return (
    <div className="flex gap-3 overflow-hidden pb-4" aria-hidden>
      {Array.from({ length: 6 }, (_, index) => (
        <div key={index} className="w-28 shrink-0 space-y-2 sm:w-32">
          <Skeleton className="aspect-2/3 rounded-lg" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      ))}
    </div>
  );
}
