import { QueryClient } from '@tanstack/react-query';
import { isAppError } from '@/shared/lib/errors';

const MINUTE = 60_000;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * MINUTE,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) =>
        !isAppError(error, 'NOT_FOUND') && !isAppError(error, 'CONFIG') && failureCount < 2,
    },
  },
});
