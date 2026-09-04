import type { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { TranslationService } from '../i18n/translation.service';
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
  const i18n = inject(TranslationService);

  return next(req).pipe(
    catchError((error: unknown) => {
      const appError = toAppError(error);
      // `messageKey` is set only for this app's own static fallback text;
      // a message the server actually sent (e.g. a validation error) has
      // no key to translate it by and is shown exactly as received.
      const message = appError.messageKey ? i18n.translate(appError.messageKey) : appError.message;
      notify.showError(message);
      return throwError(() => appError);
    }),
  );
};
