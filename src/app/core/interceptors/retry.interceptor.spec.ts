import type { HttpErrorResponse } from '@angular/common/http';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { retryInterceptor } from './retry.interceptor';

describe('retryInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([retryInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    vi.useFakeTimers();
  });

  afterEach(() => {
    httpMock.verify();
    vi.useRealTimers();
  });

  it('retries a failing GET with backoff and resolves once it succeeds', async () => {
    let result: unknown;
    let errored = false;
    http.get('/api/tasks').subscribe({ next: (r) => (result = r), error: () => (errored = true) });

    httpMock.expectOne('/api/tasks').flush(null, { status: 500, statusText: 'Server Error' });
    await vi.advanceTimersByTimeAsync(300);
    httpMock.expectOne('/api/tasks').flush(null, { status: 500, statusText: 'Server Error' });
    await vi.advanceTimersByTimeAsync(600);
    httpMock.expectOne('/api/tasks').flush([{ id: 'task-1' }]);

    expect(errored).toBe(false);
    expect(result).toEqual([{ id: 'task-1' }]);
  });

  it('gives up after exhausting retries on a persistent 500', async () => {
    let errored: HttpErrorResponse | undefined;
    http.get('/api/tasks').subscribe({ error: (e: HttpErrorResponse) => (errored = e) });

    httpMock.expectOne('/api/tasks').flush(null, { status: 500, statusText: 'Server Error' });
    await vi.advanceTimersByTimeAsync(300);
    httpMock.expectOne('/api/tasks').flush(null, { status: 500, statusText: 'Server Error' });
    await vi.advanceTimersByTimeAsync(600);
    httpMock.expectOne('/api/tasks').flush(null, { status: 500, statusText: 'Server Error' });

    expect(errored?.status).toBe(500);
  });

  it('does not retry a 4xx client error', () => {
    let errored: HttpErrorResponse | undefined;
    http.get('/api/tasks').subscribe({ error: (e: HttpErrorResponse) => (errored = e) });

    httpMock.expectOne('/api/tasks').flush(null, { status: 404, statusText: 'Not Found' });

    expect(errored?.status).toBe(404);
  });

  it('never retries a non-GET request', () => {
    let errored: HttpErrorResponse | undefined;
    http.post('/api/tasks', {}).subscribe({ error: (e: HttpErrorResponse) => (errored = e) });

    httpMock.expectOne('/api/tasks').flush(null, { status: 500, statusText: 'Server Error' });

    expect(errored?.status).toBe(500);
  });

  it('retries a network error (status 0)', async () => {
    let result: unknown;
    http.get('/api/tasks').subscribe({ next: (r) => (result = r) });

    httpMock
      .expectOne('/api/tasks')
      .error(new ProgressEvent('error'), { status: 0, statusText: 'Unknown Error' });
    await vi.advanceTimersByTimeAsync(300);
    httpMock.expectOne('/api/tasks').flush([{ id: 'task-1' }]);

    expect(result).toEqual([{ id: 'task-1' }]);
  });
});
