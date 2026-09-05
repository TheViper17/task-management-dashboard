import { HttpErrorResponse } from '@angular/common/http';
import type { AppError } from '../models/app-error.model';

/**
 * Maps any error a request might throw into a closed, user-safe AppError.
 * Kept as a plain function rather than inline in the interceptor, so the
 * mapping rules can be tested without spinning up HttpClientTesting.
 */
export function toAppError(error: unknown): AppError {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) {
      return {
        kind: 'network',
        message: 'Unable to reach the server. Check your connection and try again.',
        messageKey: 'error.network',
        cause: error,
      };
    }
    if (error.status === 404) {
      return {
        kind: 'not-found',
        message: 'The requested item could not be found.',
        messageKey: 'error.notFound',
        status: 404,
        cause: error,
      };
    }
    if (error.status === 400 || error.status === 422) {
      const serverMessage = extractServerMessage(error);
      return {
        kind: 'validation',
        message: serverMessage ?? 'The request was invalid.',
        // Only a static fallback has a translation — a message the
        // server actually sent has nothing to translate it against.
        ...(serverMessage ? {} : { messageKey: 'error.validation' }),
        status: error.status,
        cause: error,
      };
    }
    if (error.status >= 500) {
      return {
        kind: 'server',
        message: 'Something went wrong on the server. Please try again shortly.',
        messageKey: 'error.server',
        status: error.status,
        cause: error,
      };
    }
    const serverMessage = extractServerMessage(error);
    return {
      kind: 'unknown',
      message: serverMessage ?? 'An unexpected error occurred.',
      ...(serverMessage ? {} : { messageKey: 'error.unknown' }),
      status: error.status,
      cause: error,
    };
  }
  return {
    kind: 'unknown',
    message: 'An unexpected error occurred.',
    messageKey: 'error.unknown',
    cause: error,
  };
}

/** Pulls a `message` field out of a JSON error body when the server sends one. */
function extractServerMessage(error: HttpErrorResponse): string | undefined {
  const body: unknown = error.error;
  if (body && typeof body === 'object' && 'message' in body && typeof body.message === 'string') {
    return body.message;
  }
  return undefined;
}
