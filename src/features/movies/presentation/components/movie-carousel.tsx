import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/shared/ui/carousel';
import type { Movie } from '../../domain/movie';
import { MovieCard } from './movie-card';
import { MovieCardSkeleton } from './movie-card-skeleton';

type MovieCarouselProps = {
  movies: Movie[];
  /** Accessible name of the carousel region, e.g. "Películas de acción". */
  label: string;
  /** Morph scope of its cards (see morph-source.ts). */
  scope: string;
  onPrefetch: (id: number) => void;
};

const ITEM = 'basis-[45%] pl-3 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6';
const ITEM_SIZES = '(min-width: 1280px) 12rem, (min-width: 640px) 30vw, 45vw';

/** A swipeable row of movie cards (recommendations, home sections). */
export function MovieCarousel({ movies, label, scope, onPrefetch }: MovieCarouselProps) {
  return (
    <Carousel opts={{ align: 'start', dragFree: true }} aria-label={label}>
      <CarouselContent className="-ml-3">
        {movies.map((movie) => (
          <CarouselItem key={movie.id} className={ITEM}>
            <MovieCard movie={movie} scope={scope} onPrefetch={onPrefetch} sizes={ITEM_SIZES} />
          </CarouselItem>
        ))}
      </CarouselContent>
      {/* Arrow buttons only where there is room for them; on touch screens the list is swiped. */}
      <CarouselPrevious className="-left-4 hidden md:inline-flex" />
      <CarouselNext className="-right-4 hidden md:inline-flex" />
    </Carousel>
  );
}

export function MovieCarouselSkeleton() {
  return (
    <div className="flex gap-3 overflow-hidden" aria-hidden>
      {Array.from({ length: 6 }, (_, index) => (
        <div key={index} className="w-[45%] shrink-0 sm:w-1/3 md:w-1/4 lg:w-1/5 xl:w-1/6">
          <MovieCardSkeleton />
        </div>
      ))}
    </div>
  );
}
