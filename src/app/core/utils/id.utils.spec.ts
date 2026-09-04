import { generateId, generateOptimisticId, isOptimisticId } from './id.utils';

describe('id.utils', () => {
  it('generateId() produces well-formed, unique UUIDs', () => {
    const a = generateId();
    const b = generateId();
    expect(a).toMatch(/^[0-9a-f-]{36}$/);
    expect(a).not.toBe(b);
  });

  it('generateOptimisticId() is prefixed and recognised by isOptimisticId()', () => {
    const id = generateOptimisticId();
    expect(id.startsWith('optimistic-')).toBe(true);
    expect(isOptimisticId(id)).toBe(true);
  });

  it('isOptimisticId() is false for a server-issued id', () => {
    expect(isOptimisticId('task-001')).toBe(false);
  });
});
