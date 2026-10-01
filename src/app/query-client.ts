import { QueryClient } from '@tanstack/react-query';
import { isAppError } from '@/shared/lib/errors';

const MINUTE = 60_000;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Movie data changes slowly: reuse what is cached for 5 minutes before asking TMDB again.
      staleTime: 5 * MINUTE,
      refetchOnWindowFocus: false,
      // Retrying cannot fix a missing movie or a bad token; network hiccups get two more tries.
      retry: (failureCount, error) =>
        !isAppError(error, 'NOT_FOUND') && !isAppError(error, 'CONFIG') && failureCount < 2,
    },
  },
});
