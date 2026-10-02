import { Film } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import type { ImageSet } from '../../domain/movie';

type PosterImageProps = {
  image: ImageSet | null;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
};

const WIDTHS = { small: 185, medium: 342, large: 500 } as const;

export function PosterImage({ image, alt, sizes, priority = false, className }: PosterImageProps) {
  if (!image) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={cn('flex size-full items-center justify-center bg-muted', className)}
      >
        <Film className="size-8 text-muted-foreground" aria-hidden />
      </div>
    );
  }

  return (
    <img
      src={image.medium}
      srcSet={`${image.small} ${WIDTHS.small}w, ${image.medium} ${WIDTHS.medium}w, ${image.large} ${WIDTHS.large}w`}
      sizes={sizes}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      decoding="async"
      className={cn('size-full bg-muted object-cover', className)}
    />
  );
}
