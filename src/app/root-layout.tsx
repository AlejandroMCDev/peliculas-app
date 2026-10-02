import { Clapperboard } from 'lucide-react';
import { Link, Outlet, ScrollRestoration } from 'react-router';
import { ModeToggle } from '@/shared/components/mode-toggle';
import { MainNav } from './main-nav';

export function RootLayout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3 sm:gap-6">
            <Link
              to="/"
              aria-label="Cartelera, ir al inicio"
              className="flex items-center gap-2 rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/60"
            >
              <Clapperboard className="size-6 text-primary" aria-hidden />
              <span className="hidden font-display text-2xl font-semibold tracking-wide uppercase min-[400px]:inline">
                Cartelera
              </span>
            </Link>
            <MainNav />
          </div>
          <ModeToggle />
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t">
        <p className="mx-auto max-w-7xl px-4 py-6 text-xs text-muted-foreground sm:px-6">
          Datos e imágenes de{' '}
          <a
            href="https://www.themoviedb.org/"
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2 hover:text-foreground"
          >
            TMDB
          </a>
          . Este producto usa la API de TMDB pero no está avalado ni certificado por TMDB.
        </p>
      </footer>

      <ScrollRestoration />
    </div>
  );
}
