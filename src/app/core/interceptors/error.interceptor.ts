import type { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { TranslationService } from '../i18n/translation.service';
import { NotificationService } from '../services/notification.service';
import { toAppError } from '../utils/error.utils';

/**
 * Turns any failed request into an AppError (see error.utils.ts), shows a
 * toast, and rethrows it so stores can still check `kind` and roll back an
 * optimistic update if they need to.
 *
 * Runs after retryInterceptor, so retries happen first against the raw
 * error — this only fires once retries are exhausted or don't apply.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notify = inject(NotificationService);
  const i18n = inject(TranslationService);

  return next(req).pipe(
    catchError((error: unknown) => {
      const appError = toAppError(error);
      // messageKey only exists for our own fallback text — a message the
      // server actually sent has nothing to translate it against, so it
      // gets shown exactly as it came in.
      const message = appError.messageKey ? i18n.translate(appError.messageKey) : appError.message;
      notify.showError(message);
      return throwError(() => appError);
    }),
  );
};
