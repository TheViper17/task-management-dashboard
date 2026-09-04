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
  message: string;
  status?: number;
  cause?: unknown;
}
