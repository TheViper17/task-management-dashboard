import { provideHttpClient, withInterceptors } from '@angular/common/http';
import type { ApplicationConfig } from '@angular/core';
import { provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';
import { cacheInterceptor } from './core/interceptors/cache.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { retryInterceptor } from './core/interceptors/retry.interceptor';
import { API_BASE_URL, CACHE_TTL_MS } from './core/tokens/api.tokens';
import { routes } from './app.routes';

/** GET responses are considered fresh for this long before a re-fetch hits the network. */
const CACHE_TTL_DEFAULT_MS = 30_000;

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),

    // Explicit even though Angular 22 defaults to zoneless when zone.js
    // isn't installed — states the intent rather than relying on an absence.
    provideZonelessChangeDetection(),

    provideRouter(
      routes,
      withComponentInputBinding(), // route params/data flow into component input()s
      withViewTransitions(), // animated navigation using the View Transitions API
      // withPreloading(...) is added in Phase 4 once feature routes exist to preload.
    ),

    // Interceptor order is deliberate — see the JSDoc on each interceptor:
    //   cache (outermost, short-circuits on a hit)
    //   -> error (maps failures to AppError, notifies)
    //   -> retry (innermost, retries the *raw* HttpErrorResponse before it's mapped)
    provideHttpClient(withInterceptors([cacheInterceptor, errorInterceptor, retryInterceptor])),

    { provide: API_BASE_URL, useValue: '/api' },
    { provide: CACHE_TTL_MS, useValue: CACHE_TTL_DEFAULT_MS },
  ],
};
