import { InjectionToken } from '@angular/core';

/**
 * Base URL every `*ApiService` prefixes its requests with. Points at the
 * `/api` path, which `proxy.conf.json` forwards to json-server on :3000
 * during development. Provided once in `app.config.ts` so tests and future
 * environments can override it without touching the services themselves.
 */
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL');

/** How long a cached GET response stays fresh, in milliseconds. See cacheInterceptor. */
export const CACHE_TTL_MS = new InjectionToken<number>('CACHE_TTL_MS');
