import axios, { isAxiosError, type AxiosInstance } from 'axios';
import { AppError } from '@/shared/lib/errors';

export const TMDB_LANGUAGE = 'es-MX';

export function createTmdbClient(token: string | undefined): AxiosInstance {
  const client = axios.create({
    baseURL: 'https://api.themoviedb.org/3',
    timeout: 10_000,
    headers: token ? { Authorization: `Bearer ${token}`, Accept: 'application/json' } : {},
    params: { language: TMDB_LANGUAGE },
  });

  client.interceptors.request.use((config) => {
    if (!token) throw new AppError('CONFIG', 'VITE_TMDB_TOKEN is not set');
    return config;
  });
  client.interceptors.response.use(undefined, (error: unknown) =>
    Promise.reject(toAppError(error)),
  );

  return client;
}

function toAppError(error: unknown): AppError {
  if (error instanceof AppError) return error;
  if (isAxiosError(error)) {
    const status = error.response?.status;
    const where = `${error.config?.method?.toUpperCase()} ${error.config?.url}`;
    if (status === 401)
      return new AppError('CONFIG', `${where}: TMDB rejected the token`, { cause: error });
    if (status === 404) return new AppError('NOT_FOUND', `${where}: not found`, { cause: error });
    if (!error.response) return new AppError('NETWORK', `${where}: no response`, { cause: error });
    return new AppError('UNEXPECTED', `${where}: HTTP ${status}`, { cause: error });
  }
  return new AppError('UNEXPECTED', 'Unexpected TMDB error', { cause: error });
}
