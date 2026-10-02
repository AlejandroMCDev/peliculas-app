import { useState } from 'react';
import { ErrorState } from '@/shared/components/error-state';
import { useInView } from '@/shared/hooks/use-in-view';
import type { FeaturedMovie } from '../domain/movie';
import { HeroCarousel, HeroCarouselSkeleton } from './components/hero-carousel';
import { MovieShelf } from './components/movie-shelf';
import { TrailerDialog } from './components/trailer-dialog';
import { HOME_REGION, HOME_SHELVES, type HomeShelf } from './home-sections';
import {
  useFeaturedMovies,
  useMovieDetail,
  useMovieShelf,
  usePrefetchMovie,
} from './movie-queries';
import { browsePath } from './paths';

/** Route container for `/`: hero with what is in theatres, then one carousel per section. */
export function HomePage() {
  const featured = useFeaturedMovies(HOME_REGION);
  const prefetchMovie = usePrefetchMovie();

  return (
    <>
      <title>Inicio · Cartelera</title>
      <h1 className="sr-only">Cartelera: películas en cines y por género</h1>

      {featured.isPending ? (
        <HeroCarouselSkeleton />
      ) : featured.isError ? (
        <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
          <ErrorState error={featured.error} onRetry={() => void featured.refetch()} />
        </div>
      ) : (
        // No movies in theatres with a wide image: no hero, the page starts at the sections.
        featured.data.length > 0 && (
          <HeroCarousel
            movies={featured.data}
            eyebrow="En cartelera en Perú"
            onPrefetch={prefetchMovie}
            renderActions={(movie, onDialogOpenChange) => (
              <HeroTrailer movie={movie} onOpenChange={onDialogOpenChange} />
            )}
          />
        )
      )}

      <div className="mx-auto max-w-7xl space-y-12 px-4 py-10 sm:px-6">
        {HOME_SHELVES.map((shelf, index) => (
          <ShelfContainer
            key={shelf.id}
            shelf={shelf}
            // The first two sections are usually on screen at once: no need to wait for scrolling.
            eager={index < 2}
            onPrefetch={prefetchMovie}
          />
        ))}
      </div>
    </>
  );
}

type ShelfContainerProps = {
  shelf: HomeShelf;
  eager: boolean;
  onPrefetch: (id: number) => void;
};

/** Loads a section only when it gets near the viewport: the home does not fire 8 requests at once. */
function ShelfContainer({ shelf, eager, onPrefetch }: ShelfContainerProps) {
  const [sectionRef, inView] = useInView<HTMLElement>('600px');
  const [wasSeen, setWasSeen] = useState(eager);
  // Once near the viewport, stay loaded even after scrolling past it.
  if (inView && !wasSeen) setWasSeen(true);

  const query = useMovieShelf(shelf.source, wasSeen);

  return (
    <MovieShelf
      ref={sectionRef}
      id={shelf.id}
      title={shelf.title}
      seeAllHref={shelf.seeAll && browsePath(shelf.seeAll)}
      movies={query.data}
      isLoading={query.isPending}
      error={query.error}
      emptyText={shelf.emptyText}
      onRetry={() => void query.refetch()}
      onPrefetch={onPrefetch}
    />
  );
}

/** Trailer button for the hero's active movie: its detail (with videos) loads only for that one. */
function HeroTrailer({
  movie,
  onOpenChange,
}: {
  movie: FeaturedMovie;
  onOpenChange: (open: boolean) => void;
}) {
  const trailer = useMovieDetail(movie.id).data?.trailer;
  if (!trailer) return null;
  return (
    <TrailerDialog
      trailer={trailer}
      movieTitle={movie.title}
      variant="outline"
      onOpenChange={onOpenChange}
    />
  );
}
