import type { TranslationKey } from '../i18n/translations/en';

/**
 * Normalised application error shape produced by `errorInterceptor`.
 *
 * Every HTTP failure is mapped to one of these `kind`s before it reaches a
 * store or component, so callers branch on a closed set instead of
 * inspecting raw `HttpErrorResponse.status` codes everywhere.
 */
export type AppErrorKind = 'network' | 'not-found' | 'validation' | 'server' | 'unknown';

export interface AppError {
  kind: AppErrorKind;
  /** English fallback / a real backend's own error text — always present, never itself translated. */
  message: string;
  /**
   * Set only when `message` is one of this app's own static fallback
   * messages, not text a server actually sent — `errorInterceptor`
   * prefers this (translated) over the raw `message` when it's present.
   * Server-supplied text has no translation to fall back to; it's shown
   * exactly as the server sent it, in whatever language that is.
   */
  messageKey?: TranslationKey;
  status?: number;
  cause?: unknown;
}
