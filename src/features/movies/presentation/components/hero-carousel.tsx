import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router';
import { usePrefersReducedMotion } from '@/shared/hooks/use-prefers-reduced-motion';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from '@/shared/ui/carousel';
import { Skeleton } from '@/shared/ui/skeleton';
import type { FeaturedMovie } from '../../domain/movie';
import { formatRating } from '../format';
import { moviePath } from '../paths';

type HeroCarouselProps = {
  movies: FeaturedMovie[];
  /** Short line above the title, e.g. "En cartelera en Perú". */
  eyebrow: string;
  onPrefetch: (id: number) => void;
  /**
   * Extra actions for the movie on screen (the trailer button): only the active one is rendered.
   * An action that opens a dialog reports it, so autoplay does not change the movie behind it.
   */
  renderActions?: (movie: FeaturedMovie, onDialogOpenChange: (open: boolean) => void) => ReactNode;
};

const AUTOPLAY_MS = 6000;
// Backdrop widths built in infrastructure (small/medium/large).
const srcSet = ({ backdrop }: FeaturedMovie) =>
  `${backdrop.small} 300w, ${backdrop.medium} 780w, ${backdrop.large} 1280w`;

/**
 * Images slide inside the carousel; the text panel sits outside it and always shows the active
 * movie. That keeps one set of buttons and lets the trailer load only for the movie on screen.
 */
export function HeroCarousel({ movies, eyebrow, onPrefetch, renderActions }: HeroCarouselProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [selected, setSelected] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const reducedMotion = usePrefersReducedMotion();
  const active = movies[selected] ?? movies[0];

  // Sync with Embla (an external system): which slide is showing.
  useEffect(() => {
    if (!api) return;
    const onSelect = () => setSelected(api.selectedScrollSnap());
    onSelect();
    api.on('select', onSelect);
    return () => void api.off('select', onSelect);
  }, [api]);

  // Autoplay, paused while the user points at it, works inside it, watches its trailer, or asked
  // for less motion.
  const autoplay =
    !!api && movies.length > 1 && !hovered && !focused && !dialogOpen && !reducedMotion;
  useEffect(() => {
    if (!autoplay || !api) return;
    // `selected` in the deps restarts the countdown after a manual change of slide.
    const timer = setInterval(() => api.scrollNext(), AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [autoplay, api, selected]);

  if (!active) return null;

  return (
    <section
      aria-label={eyebrow}
      className="relative isolate"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
      }}
    >
      <Carousel setApi={setApi} opts={{ loop: true, duration: reducedMotion ? 0 : 30 }}>
        <CarouselContent className="ml-0">
          {movies.map((movie, index) => (
            <CarouselItem
              key={movie.id}
              className="pl-0"
              aria-label={`${index + 1} de ${movies.length}`}
            >
              <img
                src={movie.backdrop.large}
                srcSet={srcSet(movie)}
                sizes="100vw"
                alt=""
                loading={index === 0 ? 'eager' : 'lazy'}
                fetchPriority={index === 0 ? 'high' : 'auto'}
                decoding="async"
                className="aspect-video w-full bg-muted object-cover sm:aspect-auto sm:h-[30rem] lg:h-[36rem]"
              />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {/* Fades the image into the page so the text keeps its contrast. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 aspect-video bg-linear-to-t from-background via-background/40 to-transparent sm:aspect-auto sm:h-[30rem] sm:via-background/60 lg:h-[36rem] lg:bg-linear-to-r lg:from-background/95 lg:via-background/50"
      />

      <div className="relative mx-auto -mt-16 max-w-7xl px-4 sm:absolute sm:inset-x-0 sm:bottom-0 sm:mt-0 sm:px-6 sm:pb-10">
        <div
          key={active.id}
          className="max-w-xl space-y-3 motion-safe:animate-in motion-safe:duration-300 motion-safe:fade-in motion-safe:slide-in-from-bottom-2"
          aria-live="polite"
        >
          <p className="text-sm font-semibold tracking-widest text-primary uppercase">{eyebrow}</p>
          <h2 className="font-display text-4xl leading-none font-semibold tracking-tight text-balance uppercase sm:text-5xl lg:text-6xl">
            {active.title}
          </h2>
          <p className="text-sm text-muted-foreground tabular-nums">
            {[active.year, active.voteCount > 0 ? `★ ${formatRating(active.rating)}` : null]
              .filter(Boolean)
              .join(' · ')}
          </p>
          {active.overview && (
            <p className="line-clamp-2 max-w-prose text-pretty sm:line-clamp-3">
              {active.overview}
            </p>
          )}
          <div className="flex flex-wrap gap-2 pt-1">
            <Button size="lg" asChild>
              <Link
                to={moviePath(active.id)}
                onMouseEnter={() => onPrefetch(active.id)}
                onFocus={() => onPrefetch(active.id)}
              >
                Ver detalles
              </Link>
            </Button>
            {renderActions?.(active, setDialogOpen)}
          </div>
        </div>

        {movies.length > 1 && (
          <div className="mt-6 flex items-center gap-3">
            <Button
              variant="outline"
              size="icon-sm"
              className="rounded-full"
              aria-label="Película anterior"
              onClick={() => api?.scrollPrev()}
            >
              <ChevronLeft />
            </Button>
            <ol className="flex items-center gap-1.5" aria-label="Elegir película">
              {movies.map((movie, index) => (
                <li key={movie.id}>
                  <button
                    type="button"
                    aria-label={`${movie.title} (${index + 1} de ${movies.length})`}
                    aria-current={index === selected ? 'true' : undefined}
                    onClick={() => api?.scrollTo(index)}
                    className="flex h-6 items-center outline-none focus-visible:ring-3 focus-visible:ring-ring/60"
                  >
                    <span
                      className={cn(
                        'block h-1.5 rounded-full bg-foreground/30 transition-[width,background-color] duration-200 motion-reduce:transition-none',
                        index === selected ? 'w-6 bg-primary' : 'w-1.5 hover:bg-foreground/60',
                      )}
                    />
                  </button>
                </li>
              ))}
            </ol>
            <Button
              variant="outline"
              size="icon-sm"
              className="rounded-full"
              aria-label="Película siguiente"
              onClick={() => api?.scrollNext()}
            >
              <ChevronRight />
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}

export function HeroCarouselSkeleton() {
  return (
    <div className="relative" aria-label="Cargando películas en cartelera">
      <Skeleton className="aspect-video w-full rounded-none sm:aspect-auto sm:h-[30rem] lg:h-[36rem]" />
      <div className="mx-auto max-w-7xl space-y-3 px-4 pt-4 sm:absolute sm:inset-x-0 sm:bottom-0 sm:px-6 sm:pb-10">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-12 w-3/4 max-w-lg" />
        <Skeleton className="h-4 w-full max-w-md" />
        <Skeleton className="h-10 w-36" />
      </div>
    </div>
  );
}
