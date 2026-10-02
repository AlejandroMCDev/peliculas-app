import { ArrowLeft, Clapperboard } from 'lucide-react';
import { ViewTransition, type ReactNode } from 'react';
import { ErrorState } from '@/shared/components/error-state';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Separator } from '@/shared/ui/separator';
import { Skeleton } from '@/shared/ui/skeleton';
import type { Movie, MovieDetail } from '../../domain/movie';
import { formatMoney, formatRating, formatRuntime, formatVotes } from '../format';
import { CastList, CastListSkeleton } from './cast-list';
import { PosterImage } from './poster-image';
import { MovieCarousel } from './movie-carousel';
import { TrailerDialog } from './trailer-dialog';

type MovieDetailViewProps = {
  /** What is already known from a list (title, poster…): painted at once while the detail loads. */
  preview: Movie | undefined;
  detail: MovieDetail | undefined;
  error: unknown;
  onRetry: () => void;
  onBack: () => void;
  onPrefetch: (id: number) => void;
};

const POSTER_SIZES = '(min-width: 768px) 18rem, 70vw';

export function MovieDetailView({
  preview,
  detail,
  error,
  onRetry,
  onBack,
  onPrefetch,
}: MovieDetailViewProps) {
  const movie = detail ?? preview;

  return (
    <article className="relative">
      {detail?.backdrop && <Backdrop src={detail.backdrop.large} />}

      <div className="relative mx-auto max-w-6xl px-4 pt-4 pb-16 sm:px-6">
        <Button variant="ghost" onClick={onBack} className="mb-4 -ml-2">
          <ArrowLeft />
          Volver
        </Button>

        {error && !detail ? (
          <ErrorState error={error} onRetry={onRetry} />
        ) : (
          <>
            <header className="grid gap-6 md:grid-cols-[18rem_1fr] md:gap-10">
              <div className="mx-auto aspect-2/3 w-56 overflow-hidden rounded-xl shadow-2xl shadow-black/40 sm:w-64 md:w-full">
                {movie ? (
                  // Same name as the card poster: this is the other half of the morph.
                  <ViewTransition name={`poster-${movie.id}`} share="morph" default="none">
                    <PosterImage
                      image={movie.poster}
                      alt={`Póster de ${movie.title}`}
                      sizes={POSTER_SIZES}
                      priority
                    />
                  </ViewTransition>
                ) : (
                  <Skeleton className="size-full rounded-none" />
                )}
              </div>

              <div className="flex flex-col gap-4 md:pt-4">
                {movie ? <TitleBlock movie={movie} detail={detail} /> : <TitleSkeleton />}
                {detail ? <Overview detail={detail} /> : <OverviewSkeleton />}
              </div>
            </header>

            <Section title="Reparto principal">
              {detail ? <CastList cast={detail.cast} /> : <CastListSkeleton />}
            </Section>

            {detail && (detail.budget !== null || detail.revenue !== null) && (
              <Section title="Taquilla">
                <dl className="grid max-w-md grid-cols-2 gap-4">
                  <Fact label="Presupuesto" value={detail.budget} />
                  <Fact label="Recaudación" value={detail.revenue} />
                </dl>
              </Section>
            )}

            {detail && (
              <Section title="También te puede gustar">
                {detail.recommendations.length > 0 ? (
                  <MovieCarousel
                    movies={detail.recommendations}
                    label="Películas recomendadas"
                    scope="recommendations"
                    onPrefetch={onPrefetch}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Aún no hay recomendaciones para esta película.
                  </p>
                )}
              </Section>
            )}
          </>
        )}
      </div>
    </article>
  );
}

function Backdrop({ src }: { src: string }) {
  return (
    <div
      className="pointer-events-none absolute inset-x-0 top-0 h-[28rem] overflow-hidden"
      aria-hidden
    >
      <img
        src={src}
        alt=""
        decoding="async"
        className="size-full scale-110 object-cover opacity-30 blur-sm motion-safe:animate-in motion-safe:duration-700 motion-safe:fade-in dark:opacity-25"
      />
      <div className="absolute inset-0 bg-linear-to-b from-background/30 via-background/70 to-background" />
    </div>
  );
}

function TitleBlock({ movie, detail }: { movie: Movie; detail: MovieDetail | undefined }) {
  return (
    <div className="space-y-3">
      <h1 className="font-display text-4xl leading-none font-semibold tracking-tight text-balance uppercase sm:text-5xl lg:text-6xl">
        {movie.title}
      </h1>
      {detail?.tagline && <p className="text-lg text-muted-foreground italic">{detail.tagline}</p>}

      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted-foreground">
        <span className="tabular-nums">{movie.year ?? 'Sin fecha'}</span>
        {detail?.runtime ? (
          <>
            <span aria-hidden>·</span>
            <span>{formatRuntime(detail.runtime)}</span>
          </>
        ) : null}
        {detail?.genres.map((genre) => (
          <Badge key={genre.id} variant="outline">
            {genre.name}
          </Badge>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <p className="flex items-baseline gap-2">
          <span className="font-display text-4xl font-semibold text-primary tabular-nums">
            ★ {formatRating(movie.rating)}
          </span>
          <span className="text-sm text-muted-foreground">
            / 10 · {formatVotes(movie.voteCount)}
          </span>
        </p>
        {detail && detail.directors.length > 0 && (
          <p className="flex items-center gap-2 text-sm">
            <Clapperboard className="size-4 text-muted-foreground" aria-hidden />
            <span className="text-muted-foreground">Dirección:</span>
            <span className="font-semibold">
              {detail.directors.map(({ name }) => name).join(', ')}
            </span>
          </p>
        )}
      </div>
    </div>
  );
}

function Overview({ detail }: { detail: MovieDetail }) {
  return (
    <>
      <div className="space-y-2">
        <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
          Sinopsis
        </h2>
        <p className="max-w-prose leading-relaxed text-pretty">
          {detail.overview || 'Sin sinopsis disponible en español.'}
        </p>
      </div>
      {detail.trailer && (
        <div>
          <TrailerDialog trailer={detail.trailer} movieTitle={detail.title} />
        </div>
      )}
    </>
  );
}

function TitleSkeleton() {
  return (
    <div className="space-y-3" aria-label="Cargando película">
      <Skeleton className="h-12 w-4/5" />
      <Skeleton className="h-5 w-1/2" />
      <Skeleton className="h-10 w-40" />
    </div>
  );
}

function OverviewSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-4 w-full max-w-prose" />
      <Skeleton className="h-4 w-full max-w-prose" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-12 space-y-4">
      <div className="flex items-center gap-4">
        <h2 className="shrink-0 font-display text-2xl font-medium tracking-wide uppercase">
          {title}
        </h2>
        <Separator className="flex-1" />
      </div>
      {children}
    </section>
  );
}

function Fact({ label, value }: { label: string; value: number | null }) {
  return (
    <div>
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="font-display text-2xl tabular-nums">
        {value === null ? '—' : formatMoney(value)}
      </dd>
    </div>
  );
}
