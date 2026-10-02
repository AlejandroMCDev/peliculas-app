import { ErrorState } from '@/shared/components/error-state';
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
        {HOME_SHELVES.map((shelf) => (
          <ShelfContainer key={shelf.id} shelf={shelf} onPrefetch={prefetchMovie} />
        ))}
      </div>
    </>
  );
}

type ShelfContainerProps = {
  shelf: HomeShelf;
  onPrefetch: (id: number) => void;
};

function ShelfContainer({ shelf, onPrefetch }: ShelfContainerProps) {
  const query = useMovieShelf(shelf.source);

  return (
    <MovieShelf
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
