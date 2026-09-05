import { HttpErrorResponse } from '@angular/common/http';
import { toAppError } from './error.utils';

describe('toAppError', () => {
  it('maps a status-0 failure to a network error, with a translation key for its static message', () => {
    const error = new HttpErrorResponse({ status: 0 });
    expect(toAppError(error)).toEqual(
      expect.objectContaining({ kind: 'network', cause: error, messageKey: 'error.network' }),
    );
  });

  it('maps a 404 to a not-found error, with a translation key for its static message', () => {
    const error = new HttpErrorResponse({ status: 404 });
    expect(toAppError(error)).toEqual(
      expect.objectContaining({ kind: 'not-found', status: 404, messageKey: 'error.notFound' }),
    );
  });

  it('maps a 400/422 to a validation error and surfaces the server message, untranslated', () => {
    const error = new HttpErrorResponse({ status: 422, error: { message: 'Title is required' } });
    const appError = toAppError(error);
    expect(appError).toEqual(
      expect.objectContaining({ kind: 'validation', status: 422, message: 'Title is required' }),
    );
    // A server-supplied message has nothing to translate it against —
    // the interceptor has to show it exactly as sent, not a generic
    // fallback.
    expect(appError.messageKey).toBeUndefined();
  });

  it('falls back to a generic, translatable validation message when the server sends none', () => {
    const error = new HttpErrorResponse({ status: 400 });
    const appError = toAppError(error);
    expect(appError.message).toBe('The request was invalid.');
    expect(appError.messageKey).toBe('error.validation');
  });

  it('maps any 5xx to a server error, with a translation key for its static message', () => {
    const error = new HttpErrorResponse({ status: 503 });
    expect(toAppError(error)).toEqual(
      expect.objectContaining({ kind: 'server', status: 503, messageKey: 'error.server' }),
    );
  });

  it('maps an unrecognised HTTP status to unknown, with a translation key when the server sent no message', () => {
    const error = new HttpErrorResponse({ status: 418 });
    expect(toAppError(error)).toEqual(
      expect.objectContaining({ kind: 'unknown', status: 418, messageKey: 'error.unknown' }),
    );
  });

  it('maps a non-HTTP error (e.g. a thrown string) to unknown, with a translation key', () => {
    expect(toAppError('boom')).toEqual(
      expect.objectContaining({
        kind: 'unknown',
        message: 'An unexpected error occurred.',
        messageKey: 'error.unknown',
      }),
    );
  });
});
