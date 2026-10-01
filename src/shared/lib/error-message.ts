import { isAppError } from './errors';

type ErrorMessage = { title: string; description: string; canRetry: boolean };

// Presentation maps error codes to user-facing copy (Spanish UI).
export function describeError(error: unknown): ErrorMessage {
  if (isAppError(error, 'CONFIG')) {
    return {
      title: 'Falta configurar TMDB',
      description:
        'Revisa que VITE_TMDB_TOKEN esté en .env.local con tu Read Access Token y reinicia el servidor.',
      canRetry: false,
    };
  }
  if (isAppError(error, 'NOT_FOUND')) {
    return {
      title: 'No encontramos esto',
      description: 'Puede que el enlace sea incorrecto o que ya no exista en TMDB.',
      canRetry: false,
    };
  }
  if (isAppError(error, 'NETWORK')) {
    return {
      title: 'Sin conexión',
      description: 'No pudimos contactar con TMDB. Revisa tu conexión e inténtalo de nuevo.',
      canRetry: true,
    };
  }
  return {
    title: 'Algo salió mal',
    description: 'Ocurrió un error inesperado. Inténtalo de nuevo en unos segundos.',
    canRetry: true,
  };
}
