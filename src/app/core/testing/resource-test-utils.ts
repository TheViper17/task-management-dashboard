import { TestBed } from '@angular/core/testing';

/**
 * Test-only helper. httpResource's loader is async even when the request
 * itself resolves synchronously, the way HttpTestingController's flush()
 * does — so its value signal only updates a tick after flush(). Call this
 * after flushing to drain that tick before asserting.
 */
export async function flushResource(): Promise<void> {
  TestBed.tick();
  await new Promise((resolve) => setTimeout(resolve, 0));
  TestBed.tick();
}
