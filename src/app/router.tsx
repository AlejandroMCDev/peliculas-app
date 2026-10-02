import { createBrowserRouter, redirect } from 'react-router';
import { HomePage, MOVIES_PATH, MoviesPage, loadMovieDetailRoute } from '@/features/movies';
import { deferPopstate } from './defer-popstate';
import { RootLayout } from './root-layout';
import { RouteError } from './route-error';

export const router = createBrowserRouter(
  [
    {
      path: '/',
      Component: RootLayout,
      ErrorBoundary: RouteError,
      children: [
        { index: true, Component: HomePage },
        { path: MOVIES_PATH, Component: MoviesPage },
        { path: `${MOVIES_PATH}/:id`, lazy: loadMovieDetailRoute },
        { path: '/movies/:id', loader: ({ params }) => redirect(`${MOVIES_PATH}/${params.id}`) },
      ],
    },
  ],
  { window: deferPopstate(window) },
);
