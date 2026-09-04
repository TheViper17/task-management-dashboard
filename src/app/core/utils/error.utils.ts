import { HttpErrorResponse } from '@angular/common/http';
import type { AppError } from '../models/app-error.model';

/**
 * Maps any error a request might throw into a closed, user-safe `AppError`.
 * Kept as a pure function (rather than inline in the interceptor) so the
 * mapping rules are unit-testable without spinning up `HttpClientTesting`.
 */
export function toAppError(error: unknown): AppError {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) {
      return {
        kind: 'network',
        message: 'Unable to reach the server. Check your connection and try again.',
        cause: error,
      };
    }
    if (error.status === 404) {
      return {
        kind: 'not-found',
        message: 'The requested item could not be found.',
        status: 404,
        cause: error,
      };
    }
    if (error.status === 400 || error.status === 422) {
      return {
        kind: 'validation',
        message: extractServerMessage(error) ?? 'The request was invalid.',
        status: error.status,
        cause: error,
      };
    }
    if (error.status >= 500) {
      return {
        kind: 'server',
        message: 'Something went wrong on the server. Please try again shortly.',
        status: error.status,
        cause: error,
      };
    }
    return {
      kind: 'unknown',
      message: extractServerMessage(error) ?? 'An unexpected error occurred.',
      status: error.status,
      cause: error,
    };
  }
  return { kind: 'unknown', message: 'An unexpected error occurred.', cause: error };
}

/** Pulls a `message` field out of a JSON error body when the server sends one. */
function extractServerMessage(error: HttpErrorResponse): string | undefined {
  const body: unknown = error.error;
  if (body && typeof body === 'object' && 'message' in body && typeof body.message === 'string') {
    return body.message;
  }
  return undefined;
}
