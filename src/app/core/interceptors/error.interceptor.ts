import type { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';
import { toAppError } from '../utils/error.utils';

/**
 * Normalises every failed request into an `AppError` (see error.utils.ts),
 * surfaces it to the user via a snackbar, and rethrows the `AppError` so
 * callers (stores) can still branch on `kind` — e.g. to roll back an
 * optimistic update.
 *
 * Placed after `retryInterceptor` in `withInterceptors([...])` so retries
 * happen against the raw `HttpErrorResponse` first; this interceptor only
 * runs once retries are exhausted (or the error wasn't retryable).
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notify = inject(NotificationService);

  return next(req).pipe(
    catchError((error: unknown) => {
      const appError = toAppError(error);
      notify.showError(appError.message);
      return throwError(() => appError);
    }),
  );
};
