import { createBrowserRouter } from 'react-router';
import { HabitsRoute, habitsAction, habitsLoader } from '@/features/habits';
import { RootLayout } from './root-layout';
import { RouteError } from './route-error';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: RootLayout,
    ErrorBoundary: RouteError,
    children: [{ index: true, Component: HabitsRoute, loader: habitsLoader, action: habitsAction }],
  },
]);
