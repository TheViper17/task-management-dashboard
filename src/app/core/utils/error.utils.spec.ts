import { HttpErrorResponse } from '@angular/common/http';
import { toAppError } from './error.utils';

describe('toAppError', () => {
  it('maps a status-0 failure to a network error', () => {
    const error = new HttpErrorResponse({ status: 0 });
    expect(toAppError(error)).toEqual(expect.objectContaining({ kind: 'network', cause: error }));
  });

  it('maps a 404 to a not-found error', () => {
    const error = new HttpErrorResponse({ status: 404 });
    expect(toAppError(error)).toEqual(expect.objectContaining({ kind: 'not-found', status: 404 }));
  });

  it('maps a 400/422 to a validation error and surfaces the server message', () => {
    const error = new HttpErrorResponse({ status: 422, error: { message: 'Title is required' } });
    expect(toAppError(error)).toEqual(
      expect.objectContaining({ kind: 'validation', status: 422, message: 'Title is required' }),
    );
  });

  it('falls back to a generic validation message when the server sends none', () => {
    const error = new HttpErrorResponse({ status: 400 });
    expect(toAppError(error).message).toBe('The request was invalid.');
  });

  it('maps any 5xx to a server error', () => {
    const error = new HttpErrorResponse({ status: 503 });
    expect(toAppError(error)).toEqual(expect.objectContaining({ kind: 'server', status: 503 }));
  });

  it('maps an unrecognised HTTP status to unknown', () => {
    const error = new HttpErrorResponse({ status: 418 });
    expect(toAppError(error)).toEqual(expect.objectContaining({ kind: 'unknown', status: 418 }));
  });

  it('maps a non-HTTP error (e.g. a thrown string) to unknown', () => {
    expect(toAppError('boom')).toEqual(
      expect.objectContaining({ kind: 'unknown', message: 'An unexpected error occurred.' }),
    );
  });
});
