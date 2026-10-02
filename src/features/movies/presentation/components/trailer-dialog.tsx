import { Play } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog';
import type { Trailer } from '../../domain/movie';

type TrailerDialogProps = {
  trailer: Trailer;
  movieTitle: string;
  variant?: 'default' | 'outline';
  onOpenChange?: (open: boolean) => void;
};

export function TrailerDialog({
  trailer,
  movieTitle,
  variant = 'default',
  onOpenChange,
}: TrailerDialogProps) {
  return (
    <Dialog onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="lg" variant={variant}>
          <Play className="fill-current" />
          Ver tráiler
        </Button>
      </DialogTrigger>
      <DialogContent className="gap-3 p-3 sm:max-w-4xl">
        <DialogHeader className="px-1 pr-8">
          <DialogTitle className="line-clamp-1">{trailer.name}</DialogTitle>
          <DialogDescription className="sr-only">Tráiler de {movieTitle}</DialogDescription>
        </DialogHeader>
        <div className="aspect-video overflow-hidden rounded-lg bg-black">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${trailer.youtubeKey}?autoplay=1&rel=0`}
            title={`Tráiler de ${movieTitle}`}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            className="size-full"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
