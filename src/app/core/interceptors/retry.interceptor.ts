import { HttpErrorResponse } from '@angular/common/http';
import type { HttpInterceptorFn } from '@angular/common/http';
import { timer } from 'rxjs';
import { retry } from 'rxjs/operators';

const MAX_RETRIES = 2;
const BASE_DELAY_MS = 300;

/**
 * Retries a failed **read** (GET) up to `MAX_RETRIES` times with exponential
 * backoff (300ms, 600ms), but only for transient failures: network errors
 * (`status === 0`) and server errors (`5xx`). A `4xx` is a client mistake
 * that won't succeed on retry, so it's rethrown immediately.
 *
 * Writes (POST/PATCH/DELETE) are never retried automatically — retrying a
 * non-idempotent request risks double-submitting it.
 *
 * Placed innermost in `withInterceptors([...])`, closest to the backend, so
 * it retries the *raw* `HttpErrorResponse` before `errorInterceptor` maps it
 * to a user-facing `AppError`.
 */
export const retryInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.method !== 'GET') return next(req);

  return next(req).pipe(
    retry({
      count: MAX_RETRIES,
      delay: (error: unknown, retryCount) => {
        const isTransient =
          error instanceof HttpErrorResponse && (error.status === 0 || error.status >= 500);
        if (!isTransient) {
          throw error;
        }
        return timer(BASE_DELAY_MS * 2 ** (retryCount - 1));
      },
    }),
  );
};
