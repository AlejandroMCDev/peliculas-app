import { createBrowserRouter } from 'react-router';
import { MoviesPage, loadMovieDetailRoute } from '@/features/movies';
import { RootLayout } from './root-layout';
import { RouteError } from './route-error';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: RootLayout,
    ErrorBoundary: RouteError,
    children: [
      { index: true, Component: MoviesPage },
      { path: 'movies/:id', lazy: loadMovieDetailRoute },
    ],
  },
]);
