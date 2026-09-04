import { TestBed } from '@angular/core/testing';

/**
 * Test-only helper: `httpResource`'s loader is asynchronous even when the
 * underlying request resolves synchronously (as `HttpTestingController`'s
 * `flush()` does), so its value signal only updates a tick after `flush()`.
 * Call this after flushing a request to drain that tick before asserting.
 */
export async function flushResource(): Promise<void> {
  TestBed.tick();
  await new Promise((resolve) => setTimeout(resolve, 0));
  TestBed.tick();
}
