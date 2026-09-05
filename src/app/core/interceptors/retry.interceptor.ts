import { HttpErrorResponse } from '@angular/common/http';
import type { HttpInterceptorFn } from '@angular/common/http';
import { timer } from 'rxjs';
import { retry } from 'rxjs/operators';

const MAX_RETRIES = 2;
const BASE_DELAY_MS = 300;

/**
 * Retries GETs on network errors or 5xx, with backoff (300ms, 600ms). Skips
 * 4xx since retrying won't fix a bad request, and never retries writes —
 * don't want to risk double-submitting something non-idempotent.
 *
 * Sits innermost in the interceptor chain, right next to the backend, so
 * it sees the raw HttpErrorResponse before errorInterceptor turns it into
 * an AppError.
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
