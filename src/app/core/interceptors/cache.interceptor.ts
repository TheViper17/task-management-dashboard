import { HttpResponse } from '@angular/common/http';
import type { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { HttpCacheStore } from '../services/http-cache-store.service';
import { CACHE_TTL_MS } from '../tokens/api.tokens';
import { resourceRootOf } from '../utils/url.utils';

/**
 * Caches GET responses for CACHE_TTL_MS, so switching screens (or two
 * stores wanting overlapping data) doesn't refetch something that's barely
 * stale. Any write invalidates everything under that resource's root, so a
 * create/update/delete always shows up on the next read.
 *
 * Sits outermost in the interceptor chain — a cache hit returns right away
 * and never even reaches errorInterceptor or retryInterceptor.
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
