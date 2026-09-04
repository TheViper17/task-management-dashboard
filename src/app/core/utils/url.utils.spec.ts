import { resourceRootOf } from './url.utils';

describe('resourceRootOf', () => {
  it('reduces a collection URL to itself', () => {
    expect(resourceRootOf('/api/tasks')).toBe('/api/tasks');
  });

  it('drops an :id segment', () => {
    expect(resourceRootOf('/api/tasks/task-1')).toBe('/api/tasks');
  });

  it('drops a query string', () => {
    expect(resourceRootOf('/api/tasks?status=todo&priority=high')).toBe('/api/tasks');
  });

  it('drops both an :id segment and a query string', () => {
    expect(resourceRootOf('/api/tasks/task-1?expand=assignee')).toBe('/api/tasks');
  });
});
