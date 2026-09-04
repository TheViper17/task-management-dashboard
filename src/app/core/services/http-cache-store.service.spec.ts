import { HttpResponse } from '@angular/common/http';
import { HttpCacheStore } from './http-cache-store.service';

describe('HttpCacheStore', () => {
  let store: HttpCacheStore;

  beforeEach(() => {
    store = new HttpCacheStore();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-04T12:00:00.000Z'));
  });

  afterEach(() => vi.useRealTimers());

  it('returns undefined for a key that was never set', () => {
    expect(store.get('/api/tasks')).toBeUndefined();
  });

  it('returns a previously set response before it expires', () => {
    const response = new HttpResponse({ body: { ok: true } });
    store.set('/api/tasks', response, 1000);

    expect(store.get('/api/tasks')).toBe(response);
  });

  it('expires an entry once its TTL has elapsed', () => {
    const response = new HttpResponse({ body: { ok: true } });
    store.set('/api/tasks', response, 1000);

    vi.advanceTimersByTime(1001);

    expect(store.get('/api/tasks')).toBeUndefined();
  });

  it('invalidate() removes every entry whose key starts with the given root', () => {
    store.set('/api/tasks', new HttpResponse({ body: [] }), 60_000);
    store.set('/api/tasks/task-1', new HttpResponse({ body: {} }), 60_000);
    store.set('/api/users', new HttpResponse({ body: [] }), 60_000);

    store.invalidate('/api/tasks');

    expect(store.get('/api/tasks')).toBeUndefined();
    expect(store.get('/api/tasks/task-1')).toBeUndefined();
    expect(store.get('/api/users')).toBeDefined();
  });

  it('clear() removes every entry', () => {
    store.set('/api/tasks', new HttpResponse({ body: [] }), 60_000);
    store.set('/api/users', new HttpResponse({ body: [] }), 60_000);

    store.clear();

    expect(store.get('/api/tasks')).toBeUndefined();
    expect(store.get('/api/users')).toBeUndefined();
  });
});
