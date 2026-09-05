import { Injectable } from '@angular/core';
import type { HttpResponse } from '@angular/common/http';

interface CacheEntry {
  response: HttpResponse<unknown>;
  expiresAt: number;
}

/**
 * Plain in-memory store behind cacheInterceptor. It's its own injectable
 * rather than a Map living inside the interceptor file so it can be tested
 * on its own and reset between runs — root scope still keeps it a single
 * shared instance across the app.
 */
@Injectable({ providedIn: 'root' })
export class HttpCacheStore {
  private readonly entries = new Map<string, CacheEntry>();

  /** Returns the cached response for `key` if present and not expired. */
  get(key: string): HttpResponse<unknown> | undefined {
    const entry = this.entries.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.entries.delete(key);
      return undefined;
    }
    return entry.response;
  }

  set(key: string, response: HttpResponse<unknown>, ttlMs: number): void {
    this.entries.set(key, { response, expiresAt: Date.now() + ttlMs });
  }

  /** Removes every cached entry whose key starts with `resourceRoot`. */
  invalidate(resourceRoot: string): void {
    for (const key of this.entries.keys()) {
      if (key.startsWith(resourceRoot)) this.entries.delete(key);
    }
  }

  clear(): void {
    this.entries.clear();
  }
}
