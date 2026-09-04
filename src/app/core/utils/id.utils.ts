/** Generates a random id using the platform's Web Crypto API. */
export function generateId(): string {
  return crypto.randomUUID();
}

const OPTIMISTIC_PREFIX = 'optimistic-';

/**
 * A placeholder id for an entity inserted into a store before the server has
 * confirmed it — see `TaskStore.create()`. Prefixed so `isOptimisticId` can
 * recognise it (e.g. to disable actions on a card that's still in flight).
 */
export function generateOptimisticId(): string {
  return `${OPTIMISTIC_PREFIX}${generateId()}`;
}

export function isOptimisticId(id: string): boolean {
  return id.startsWith(OPTIMISTIC_PREFIX);
}
