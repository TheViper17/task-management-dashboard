/**
 * Reduces a request URL to its "resource root" — API base plus collection
 * name, dropping any /:id segment and query string. cacheInterceptor uses
 * this to invalidate every cached GET for a collection when a write hits
 * any URL under it.
 *
 * Assumes the fixed /api/<collection>[/:id] shape this mock backend uses,
 * e.g. /api/tasks/task-1?foo=bar -> /api/tasks.
 */
export function resourceRootOf(url: string): string {
  const path = url.split('?')[0];
  const segments = path.split('/').filter(Boolean);
  return '/' + segments.slice(0, 2).join('/');
}
