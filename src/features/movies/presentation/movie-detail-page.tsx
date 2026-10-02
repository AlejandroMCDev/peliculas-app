import { useLocation, useNavigate, useParams } from 'react-router';
import { z } from 'zod';
import { AppError } from '@/shared/lib/errors';
import { MovieDetailView } from './components/movie-detail-view';
import { useCachedMovie, useMovieDetail, usePrefetchMovie } from './movie-queries';

// An invalid id (/peliculas/abc) becomes 0: the query stays disabled and the page shows "not found".
const idSchema = z.coerce.number().int().positive().catch(0);
const INVALID_ID = new AppError('NOT_FOUND', 'Invalid movie id');

/** Route container for `/peliculas/:id`. */
export function MovieDetailPage() {
  const params = useParams();
  const id = idSchema.parse(params.id);
  const navigate = useNavigate();
  const location = useLocation();

  const preview = useCachedMovie(id);
  const detail = useMovieDetail(id);
  const prefetchMovie = usePrefetchMovie();

  // Back keeps the list's filters and scroll; opened from a shared link there is no history, so go home.
  const goBack = () => (location.key === 'default' ? void navigate('/') : void navigate(-1));

  const title = detail.data?.title ?? preview?.title;

  return (
    <>
      <title>{title ? `${title} · Cartelera` : 'Película · Cartelera'}</title>
      {/* key: a recommendation opens a fresh view, so no state leaks from the previous movie. */}
      <MovieDetailView
        key={id}
        preview={preview}
        detail={detail.data}
        error={id === 0 ? INVALID_ID : detail.error}
        onRetry={() => void detail.refetch()}
        onBack={goBack}
        onPrefetch={prefetchMovie}
      />
    </>
  );
}
