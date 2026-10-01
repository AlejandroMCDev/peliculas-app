import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/shared/ui/carousel';
import type { Movie } from '../../domain/movie';
import { MovieCard } from './movie-card';

type RecommendationsProps = { movies: Movie[]; onPrefetch: (id: number) => void };

const ITEM_SIZES = '(min-width: 1024px) 12rem, (min-width: 640px) 30vw, 45vw';

export function Recommendations({ movies, onPrefetch }: RecommendationsProps) {
  if (movies.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Aún no hay recomendaciones para esta película.
      </p>
    );
  }

  return (
    <Carousel opts={{ align: 'start', dragFree: true }} aria-label="Películas recomendadas">
      <CarouselContent className="-ml-3">
        {movies.map((movie) => (
          <CarouselItem
            key={movie.id}
            className="basis-[45%] pl-3 sm:basis-1/3 md:basis-1/4 lg:basis-1/5"
          >
            <MovieCard movie={movie} onPrefetch={onPrefetch} sizes={ITEM_SIZES} />
          </CarouselItem>
        ))}
      </CarouselContent>
      {/* Arrow buttons only where there is room for them; on touch screens the list is swiped. */}
      <CarouselPrevious className="-left-4 hidden md:inline-flex" />
      <CarouselNext className="-right-4 hidden md:inline-flex" />
    </Carousel>
  );
}
