export type AppErrorCode = 'VALIDATION' | 'NOT_FOUND' | 'NETWORK' | 'UNEXPECTED';

export class AppError extends Error {
  readonly code: AppErrorCode;

  constructor(code: AppErrorCode, message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'AppError';
    this.code = code;
  }
}

export function isAppError(error: unknown, code?: AppErrorCode): error is AppError {
  return error instanceof AppError && (code === undefined || error.code === code);
}
