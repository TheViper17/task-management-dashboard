import type { TranslationKey } from '../i18n/translations/en';

/**
 * Normalised error shape produced by errorInterceptor.
 *
 * Every HTTP failure gets mapped to one of these kinds before it reaches
 * a store or component, so callers branch on a closed set instead of
 * checking raw HttpErrorResponse.status codes everywhere.
 */
export type AppErrorKind = 'network' | 'not-found' | 'validation' | 'server' | 'unknown';

export interface AppError {
  kind: AppErrorKind;
  /** English fallback / a real backend's own error text — always present, never itself translated. */
  message: string;
  /**
   * Set only when message is one of this app's own fallback messages, not
   * text a server actually sent. errorInterceptor prefers this
   * (translated) over the raw message when it's present — server text has
   * nothing to translate against, so it's shown exactly as sent.
   */
  messageKey?: TranslationKey;
  status?: number;
  cause?: unknown;
}
