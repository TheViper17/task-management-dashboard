import type { Task } from '../models/task.model';
import { ActivityStore } from './activity.store';

const STORAGE_KEY = 'task-dashboard:activity-feed';

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'task-1',
    title: 'Write tests',
    description: 'desc',
    status: 'todo',
    priority: 'medium',
    dueDate: '2026-09-10',
    isOverdue: false,
    assignee: { id: 'user-1', name: 'Ada Lovelace', avatar: 'AL', email: 'ada@company.com' },
    assigneeId: 'user-1',
    tags: [],
    order: 0,
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('ActivityStore', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('starts empty when localStorage has nothing stored', () => {
    expect(new ActivityStore().entries()).toEqual([]);
  });

  it('starts empty and recovers gracefully when localStorage holds corrupt JSON', () => {
    localStorage.setItem(STORAGE_KEY, '{not valid json');
    expect(new ActivityStore().entries()).toEqual([]);
  });

  describe('seedIfEmpty', () => {
    it('backfills from the most recently updated tasks, newest first, capped at 10', () => {
      const tasks = Array.from({ length: 12 }, (_, i) =>
        makeTask({
          id: `task-${i}`,
          updatedAt: `2026-09-${String(i + 1).padStart(2, '0')}T00:00:00.000Z`,
        }),
      );
      const store = new ActivityStore();

      store.seedIfEmpty(tasks);

      const entries = store.entries();
      expect(entries).toHaveLength(10);
      expect(entries[0].taskId).toBe('task-11'); // most recently updated
      expect(entries.at(-1)?.taskId).toBe('task-2');
    });

    it('marks a done task as "completed" and everything else as "updated"', () => {
      const store = new ActivityStore();
      store.seedIfEmpty([
        makeTask({ id: 'done-task', status: 'done' }),
        makeTask({ id: 'todo-task', status: 'todo', updatedAt: '2026-08-31T00:00:00.000Z' }),
      ]);

      const [completed, updated] = store.entries();
      expect(completed).toEqual(
        expect.objectContaining({ taskId: 'done-task', type: 'completed' }),
      );
      expect(updated).toEqual(expect.objectContaining({ taskId: 'todo-task', type: 'updated' }));
    });

    it('does nothing when entries already exist', () => {
      const store = new ActivityStore();
      store.record('created', makeTask({ id: 'existing' }));

      store.seedIfEmpty([makeTask({ id: 'should-not-appear' })]);

      expect(store.entries().map((e) => e.taskId)).toEqual(['existing']);
    });

    it('does nothing when given an empty task list', () => {
      const store = new ActivityStore();
      store.seedIfEmpty([]);
      expect(store.entries()).toEqual([]);
    });
  });

  describe('record', () => {
    it('prepends a new entry with the given type, task id, and title', () => {
      const store = new ActivityStore();
      store.record('created', makeTask({ id: 'task-1', title: 'Write tests' }), 'via smoke test');

      expect(store.entries()[0]).toEqual(
        expect.objectContaining({
          type: 'created',
          taskId: 'task-1',
          taskTitle: 'Write tests',
          detail: 'via smoke test',
        }),
      );
    });

    it('caps the feed at 50 entries, evicting the oldest', () => {
      const store = new ActivityStore();
      for (let i = 0; i < 55; i++) {
        store.record('updated', makeTask({ id: `task-${i}` }));
      }

      const entries = store.entries();
      expect(entries).toHaveLength(50);
      expect(entries[0].taskId).toBe('task-54'); // most recent stays
      expect(entries.at(-1)?.taskId).toBe('task-5'); // oldest 5 evicted
    });

    it('persists entries so a new store instance picks them up', () => {
      const first = new ActivityStore();
      first.record('created', makeTask({ id: 'task-1' }));

      const second = new ActivityStore();
      expect(second.entries()).toEqual(first.entries());
    });

    it('keeps working in-memory even if localStorage.setItem throws', () => {
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('quota exceeded');
      });

      const store = new ActivityStore();
      expect(() => store.record('created', makeTask())).not.toThrow();
      expect(store.entries()).toHaveLength(1);

      setItemSpy.mockRestore();
    });
  });

  describe('clear', () => {
    it('empties the feed and persists the empty state', () => {
      const store = new ActivityStore();
      store.record('created', makeTask());

      store.clear();

      expect(store.entries()).toEqual([]);
      expect(new ActivityStore().entries()).toEqual([]);
    });
  });
});
