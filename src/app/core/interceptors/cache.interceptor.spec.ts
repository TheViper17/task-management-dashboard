import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CACHE_TTL_MS } from '../tokens/api.tokens';
import { cacheInterceptor } from './cache.interceptor';

describe('cacheInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([cacheInterceptor])),
        provideHttpClientTesting(),
        { provide: CACHE_TTL_MS, useValue: 30_000 },
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('serves a second GET to the same URL from cache instead of hitting the backend', () => {
    let first: unknown;
    let second: unknown;

    http.get('/api/tasks').subscribe((r) => (first = r));
    httpMock.expectOne('/api/tasks').flush([{ id: 'task-1' }]);

    http.get('/api/tasks').subscribe((r) => (second = r));
    httpMock.expectNone('/api/tasks');

    expect(second).toEqual(first);
  });

  it('treats different query strings as different cache keys', () => {
    http.get('/api/tasks?status=todo').subscribe();
    httpMock.expectOne('/api/tasks?status=todo').flush([]);

    http.get('/api/tasks?status=done').subscribe();
    httpMock.expectOne('/api/tasks?status=done').flush([]);
  });

  it('invalidates cached GETs for a resource after a write to it', () => {
    http.get('/api/tasks').subscribe();
    httpMock.expectOne('/api/tasks').flush([]);

    http.post('/api/tasks', { title: 'New task' }).subscribe();
    httpMock.expectOne('/api/tasks').flush({ id: 'task-2' });

    http.get('/api/tasks').subscribe();
    httpMock.expectOne('/api/tasks').flush([{ id: 'task-2' }]);
  });

  it('does not invalidate a different resource', () => {
    http.get('/api/users').subscribe();
    httpMock.expectOne('/api/users').flush([]);

    http.post('/api/tasks', { title: 'New task' }).subscribe();
    httpMock.expectOne('/api/tasks').flush({ id: 'task-2' });

    http.get('/api/users').subscribe();
    httpMock.expectNone('/api/users');
  });
});
