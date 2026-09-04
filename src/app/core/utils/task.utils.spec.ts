import type { CreateTaskDto, Task, TaskFilters } from '../models/task.model';
import { DEFAULT_TASK_FILTERS } from '../models/task.model';
import {
  applyTaskPatch,
  countByPriority,
  countByStatus,
  createOptimisticTask,
  daysUntil,
  deriveTaskCounts,
  filterTasks,
  groupByStatus,
  isTaskOverdue,
} from './task.utils';

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'task-1',
    title: 'Write tests',
    description: 'Cover the utils module',
    status: 'todo',
    priority: 'medium',
    dueDate: '2026-09-10',
    isOverdue: false,
    assignee: { id: 'user-1', name: 'Ada Lovelace', avatar: 'AL', email: 'ada@company.com' },
    assigneeId: 'user-1',
    tags: ['Testing'],
    order: 0,
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('task.utils', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-04T12:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('isTaskOverdue', () => {
    it('is false for a done task even with a past due date', () => {
      expect(isTaskOverdue({ dueDate: '2026-09-01', status: 'done' })).toBe(false);
    });

    it('is true when the due date is before today and the task is not done', () => {
      expect(isTaskOverdue({ dueDate: '2026-09-01', status: 'todo' })).toBe(true);
      expect(isTaskOverdue({ dueDate: '2026-09-01', status: 'in_progress' })).toBe(true);
    });

    it('is false when the due date is today or in the future', () => {
      expect(isTaskOverdue({ dueDate: '2026-09-04', status: 'todo' })).toBe(false);
      expect(isTaskOverdue({ dueDate: '2026-09-05', status: 'todo' })).toBe(false);
    });
  });

  describe('daysUntil', () => {
    it('returns 0 for today, positive for the future, negative for the past', () => {
      expect(daysUntil('2026-09-04')).toBe(0);
      expect(daysUntil('2026-09-06')).toBe(2);
      expect(daysUntil('2026-09-01')).toBe(-3);
    });
  });

  describe('filterTasks', () => {
    const tasks = [
      makeTask({
        id: '1',
        title: 'Design homepage',
        status: 'todo',
        priority: 'high',
        assigneeId: 'user-1',
      }),
      makeTask({
        id: '2',
        title: 'Fix login bug',
        status: 'in_progress',
        priority: 'low',
        assigneeId: 'user-2',
      }),
      makeTask({
        id: '3',
        title: 'Write documentation',
        description: 'Covers the search index',
        status: 'done',
        priority: 'medium',
        assigneeId: 'user-1',
      }),
    ];

    it('returns everything when filters are default and search is empty', () => {
      expect(filterTasks(tasks, DEFAULT_TASK_FILTERS, '')).toHaveLength(3);
    });

    it('filters by status', () => {
      const filters: TaskFilters = { ...DEFAULT_TASK_FILTERS, status: 'todo' };
      expect(filterTasks(tasks, filters, '').map((t) => t.id)).toEqual(['1']);
    });

    it('filters by priority', () => {
      const filters: TaskFilters = { ...DEFAULT_TASK_FILTERS, priority: 'low' };
      expect(filterTasks(tasks, filters, '').map((t) => t.id)).toEqual(['2']);
    });

    it('filters by assignee', () => {
      const filters: TaskFilters = { ...DEFAULT_TASK_FILTERS, assigneeId: 'user-1' };
      expect(filterTasks(tasks, filters, '').map((t) => t.id)).toEqual(['1', '3']);
    });

    it('combines filters and search (AND semantics)', () => {
      const filters: TaskFilters = { ...DEFAULT_TASK_FILTERS, assigneeId: 'user-1' };
      expect(filterTasks(tasks, filters, 'design').map((t) => t.id)).toEqual(['1']);
    });

    it('searches case-insensitively across title and description', () => {
      expect(filterTasks(tasks, DEFAULT_TASK_FILTERS, 'SEARCH INDEX').map((t) => t.id)).toEqual([
        '3',
      ]);
    });
  });

  describe('groupByStatus', () => {
    it('buckets tasks by status and sorts each bucket by order', () => {
      const tasks = [
        makeTask({ id: 'a', status: 'todo', order: 2 }),
        makeTask({ id: 'b', status: 'todo', order: 0 }),
        makeTask({ id: 'c', status: 'done', order: 0 }),
      ];
      const groups = groupByStatus(tasks);
      expect(groups.todo.map((t) => t.id)).toEqual(['b', 'a']);
      expect(groups.in_progress).toEqual([]);
      expect(groups.done.map((t) => t.id)).toEqual(['c']);
    });
  });

  describe('countByPriority / countByStatus', () => {
    const tasks = [
      makeTask({ priority: 'high', status: 'todo' }),
      makeTask({ priority: 'high', status: 'in_progress' }),
      makeTask({ priority: 'low', status: 'done' }),
    ];

    it('counts every priority bucket, including zero counts', () => {
      expect(countByPriority(tasks)).toEqual({ low: 1, medium: 0, high: 2 });
    });

    it('counts every status bucket, including zero counts', () => {
      expect(countByStatus(tasks)).toEqual({ todo: 1, in_progress: 1, done: 1 });
    });
  });

  describe('deriveTaskCounts', () => {
    it('derives total/completed/in-progress/overdue from live task state', () => {
      const tasks = [
        makeTask({ status: 'done', dueDate: '2026-09-01' }),
        makeTask({ status: 'in_progress', dueDate: '2026-09-01' }), // overdue
        makeTask({ status: 'todo', dueDate: '2026-09-10' }), // not overdue
      ];
      expect(deriveTaskCounts(tasks)).toEqual({
        total: 3,
        completed: 1,
        inProgress: 1,
        overdue: 1,
      });
    });

    it('returns all zeros for an empty list', () => {
      expect(deriveTaskCounts([])).toEqual({ total: 0, completed: 0, inProgress: 0, overdue: 0 });
    });
  });

  describe('createOptimisticTask', () => {
    const assignee = { id: 'user-1', name: 'Ada Lovelace', avatar: 'AL', email: 'ada@company.com' };
    const dto: CreateTaskDto = {
      title: 'New task',
      description: 'desc',
      status: 'todo',
      priority: 'medium',
      dueDate: '2026-09-01', // in the past relative to the faked "today"
      assigneeId: 'user-1',
      tags: ['Design'],
    };

    it('builds a Task with an optimistic id, the given assignee, and a derived isOverdue', () => {
      const task = createOptimisticTask(dto, assignee, []);
      expect(task.id).toMatch(/^optimistic-/);
      expect(task.assignee).toBe(assignee);
      expect(task.isOverdue).toBe(true);
      expect(task.title).toBe(dto.title);
    });

    it('places the task last within its target status column', () => {
      const existing = [
        makeTask({ status: 'todo', order: 0 }),
        makeTask({ status: 'todo', order: 1 }),
        makeTask({ status: 'done', order: 0 }),
      ];
      const task = createOptimisticTask(dto, assignee, existing);
      expect(task.order).toBe(2);
    });
  });

  describe('applyTaskPatch', () => {
    it('merges the patch fields into the task', () => {
      const task = makeTask({ title: 'Old title', priority: 'low' });
      const patched = applyTaskPatch(task, { title: 'New title' });
      expect(patched.title).toBe('New title');
      expect(patched.priority).toBe('low');
    });

    it('recomputes isOverdue from the merged status and due date', () => {
      const task = makeTask({ status: 'todo', dueDate: '2026-09-01', isOverdue: false });
      const patched = applyTaskPatch(task, { status: 'done' });
      expect(patched.isOverdue).toBe(false); // done tasks are never overdue

      const stillTodo = applyTaskPatch(task, { dueDate: '2026-09-01' });
      expect(stillTodo.isOverdue).toBe(true); // past due date, still todo
    });

    it('bumps updatedAt', () => {
      const task = makeTask({ updatedAt: '2020-01-01T00:00:00.000Z' });
      const patched = applyTaskPatch(task, { title: 'x' });
      expect(patched.updatedAt).toBe('2026-09-04T12:00:00.000Z'); // faked "now"
    });
  });
});
