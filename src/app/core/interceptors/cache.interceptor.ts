import { HttpResponse } from '@angular/common/http';
import type { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { HttpCacheStore } from '../services/http-cache-store.service';
import { CACHE_TTL_MS } from '../tokens/api.tokens';
import { resourceRootOf } from '../utils/url.utils';

/**
 * Caches GET responses for `CACHE_TTL_MS` so re-visiting a screen (or two
 * stores requesting overlapping data) doesn't re-fetch instantly-stale data.
 * Any non-GET request invalidates every cached entry under that resource's
 * root, so a create/update/delete is always reflected on the next read.
 *
 * Placed outermost in `withInterceptors([...])`: a cache hit returns
 * immediately and never reaches `errorInterceptor` or `retryInterceptor`.
 */
export const cacheInterceptor: HttpInterceptorFn = (req, next) => {
  const cache = inject(HttpCacheStore);
  const ttlMs = inject(CACHE_TTL_MS);

  if (req.method !== 'GET') {
    cache.invalidate(resourceRootOf(req.urlWithParams));
    return next(req);
  }

  const cached = cache.get(req.urlWithParams);
  if (cached) {
    return of(cached.clone());
  }

  return next(req).pipe(
    tap((event) => {
      if (event instanceof HttpResponse) {
        cache.set(req.urlWithParams, event, ttlMs);
      }
    }),
  );
};
