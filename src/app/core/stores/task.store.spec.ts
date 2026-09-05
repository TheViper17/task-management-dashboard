import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { TaskApiService } from '../api/task-api.service';
import type { Assignee, CreateTaskDto, Task } from '../models/task.model';
import { flushResource } from '../testing/resource-test-utils';
import { API_BASE_URL } from '../tokens/api.tokens';
import { ActivityStore } from './activity.store';
import { TaskStore } from './task.store';
import { UserStore } from './user.store';

const BASE_URL = '/api';

const ASSIGNEE: Assignee = {
  id: 'user-1',
  name: 'Ada Lovelace',
  avatar: 'AL',
  email: 'ada@company.com',
};

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'task-1',
    title: 'Design homepage',
    description: 'Create wireframes',
    status: 'todo',
    priority: 'high',
    dueDate: '2026-09-10',
    isOverdue: false,
    assignee: ASSIGNEE,
    assigneeId: ASSIGNEE.id,
    tags: ['Design'],
    order: 0,
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('TaskStore', () => {
  let store: TaskStore;
  let httpMock: HttpTestingController;
  let apiSpy: {
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };
  let activitySpy: { record: ReturnType<typeof vi.fn>; seedIfEmpty: ReturnType<typeof vi.fn> };
  let userStoreStub: { findById: ReturnType<typeof vi.fn> };

  /** Resolves the store's initial GET /api/tasks with the given seed data. */
  async function seed(tasks: Task[]): Promise<void> {
    TestBed.tick();
    httpMock.expectOne(`${BASE_URL}/tasks`).flush(tasks);
    await flushResource();
  }

  beforeEach(() => {
    apiSpy = { create: vi.fn(), update: vi.fn(), delete: vi.fn() };
    activitySpy = { record: vi.fn(), seedIfEmpty: vi.fn() };
    userStoreStub = { findById: vi.fn().mockReturnValue(ASSIGNEE) };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: BASE_URL },
        { provide: TaskApiService, useValue: apiSpy },
        { provide: ActivityStore, useValue: activitySpy },
        { provide: UserStore, useValue: userStoreStub },
      ],
    });
    store = TestBed.inject(TaskStore);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  describe('reads', () => {
    it('starts with an empty task list before the initial request resolves', () => {
      expect(store.tasks()).toEqual([]);
      TestBed.tick();
      httpMock.expectOne(`${BASE_URL}/tasks`).flush([]);
    });

    it('exposes the loaded tasks and derives counts/columns/mixes from them', async () => {
      await seed([
        makeTask({ id: '1', status: 'todo', priority: 'high' }),
        makeTask({ id: '2', status: 'in_progress', priority: 'medium', dueDate: '2020-01-01' }),
        makeTask({ id: '3', status: 'done', priority: 'low' }),
      ]);

      expect(store.tasks()).toHaveLength(3);
      expect(store.counts()).toEqual({ total: 3, completed: 1, inProgress: 1, overdue: 1 });
      expect(store.columns().todo.map((t) => t.id)).toEqual(['1']);
      expect(store.priorityMix()).toEqual({ low: 1, medium: 1, high: 1 });
      expect(store.statusMix()).toEqual({ todo: 1, in_progress: 1, done: 1 });
    });

    it('seeds the activity feed exactly once, after the initial load resolves', async () => {
      const tasks = [makeTask()];
      await seed(tasks);

      expect(activitySpy.seedIfEmpty).toHaveBeenCalledTimes(1);
      expect(activitySpy.seedIfEmpty).toHaveBeenCalledWith(tasks);

      store.reload();
      await seed(tasks);
      expect(activitySpy.seedIfEmpty).toHaveBeenCalledTimes(1); // not called again
    });
  });

  describe('filtering and search', () => {
    beforeEach(() =>
      seed([
        makeTask({ id: '1', title: 'Design homepage', status: 'todo', priority: 'high' }),
        makeTask({ id: '2', title: 'Fix bug', status: 'done', priority: 'low' }),
      ]),
    );

    it('setSearch() narrows filteredTasks by title/description', () => {
      store.setSearch('design');
      expect(store.filteredTasks().map((t) => t.id)).toEqual(['1']);
    });

    it('setFilters() narrows filteredTasks by status', () => {
      store.setFilters({ status: 'done' });
      expect(store.filteredTasks().map((t) => t.id)).toEqual(['2']);
    });

    it('resetFilters() clears both filters and search', () => {
      store.setSearch('design');
      store.setFilters({ status: 'done' });
      store.resetFilters();
      expect(store.filteredTasks()).toHaveLength(2);
    });
  });

  describe('create', () => {
    const dto: CreateTaskDto = {
      title: 'New task',
      description: 'desc',
      status: 'todo',
      priority: 'low',
      dueDate: '2026-09-20',
      assigneeId: 'user-1',
      tags: [],
    };

    it('inserts an optimistic task immediately, then reconciles with the server response', async () => {
      await seed([]);
      // Mimics what the mock backend actually sends back from a bare POST —
      // no embedded assignee, since json-server can't do relational joins.
      // The cast is intentional, not a typo — it's reproducing a real shape
      // mismatch against Task's type.
      const rawResponse = {
        ...makeTask({ id: 'task-99', ...dto }),
        assignee: undefined,
      } as unknown as Task;
      apiSpy.create.mockReturnValue(of(rawResponse));

      const promise = store.create(dto);
      expect(store.tasks()[0].id).toMatch(/^optimistic-/);

      const result = await promise;
      expect(apiSpy.create).toHaveBeenCalledWith(dto, ASSIGNEE);
      // The store has to overlay the assignee itself — it can't trust the
      // server response to carry one back. This is the actual bug that
      // used to crash TaskCard's template.
      const expected = { ...rawResponse, assignee: ASSIGNEE };
      expect(result).toEqual(expected);
      expect(store.tasks()).toEqual([expected]);
      expect(activitySpy.record).toHaveBeenCalledWith('created', expected);
    });

    it('removes the optimistic task and rethrows if the request fails', async () => {
      await seed([]);
      apiSpy.create.mockReturnValue(throwError(() => new Error('network down')));

      await expect(store.create(dto)).rejects.toThrow('network down');
      expect(apiSpy.create).toHaveBeenCalledWith(dto, ASSIGNEE);
      expect(store.tasks()).toEqual([]);
      expect(activitySpy.record).not.toHaveBeenCalled();
    });

    it('skips the optimistic insert when the assignee cannot be resolved', async () => {
      await seed([]);
      userStoreStub.findById.mockReturnValue(undefined);
      const created = makeTask({ id: 'task-99', ...dto });
      apiSpy.create.mockReturnValue(of(created));

      const promise = store.create(dto);
      expect(store.tasks()).toEqual([]); // nothing optimistic yet

      await promise;
      expect(apiSpy.create).toHaveBeenCalledWith(dto); // no assignee to embed
      expect(store.tasks()).toEqual([created]);
    });
  });

  describe('update', () => {
    it('applies the patch optimistically, then reconciles with the server response', async () => {
      await seed([makeTask({ id: '1', title: 'Old title' })]);
      const updated = makeTask({ id: '1', title: 'New title' });
      apiSpy.update.mockReturnValue(of(updated));

      const promise = store.update('1', { title: 'New title' });
      expect(store.tasks()[0].title).toBe('New title'); // optimistic, before await

      await promise;
      // No assigneeId in the patch, so nothing to resolve or overlay.
      expect(apiSpy.update).toHaveBeenCalledWith('1', { title: 'New title' }, undefined);
      expect(store.tasks()).toEqual([updated]);
      expect(activitySpy.record).toHaveBeenCalledWith('updated', updated);
    });

    it('reassigning a task resolves and overlays the new assignee, even if the server echoes back without it', async () => {
      await seed([makeTask({ id: '1' })]);
      const newAssignee: Assignee = {
        id: 'user-2',
        name: 'Grace Hopper',
        avatar: 'GH',
        email: 'grace@company.com',
      };
      userStoreStub.findById.mockReturnValue(newAssignee);
      // Same shape mismatch as create() — the raw response has an
      // assigneeId but no embedded assignee.
      const rawResponse = {
        ...makeTask({ id: '1', assigneeId: newAssignee.id }),
        assignee: undefined,
      } as unknown as Task;
      apiSpy.update.mockReturnValue(of(rawResponse));

      const result = await store.update('1', { assigneeId: newAssignee.id });

      expect(userStoreStub.findById).toHaveBeenCalledWith(newAssignee.id);
      expect(apiSpy.update).toHaveBeenCalledWith('1', { assigneeId: newAssignee.id }, newAssignee);
      expect(result.assignee).toEqual(newAssignee);
      expect(store.tasks()[0].assignee).toEqual(newAssignee);
    });

    it('rolls back to the previous state and rethrows if the request fails', async () => {
      const original = makeTask({ id: '1', title: 'Old title' });
      await seed([original]);
      apiSpy.update.mockReturnValue(throwError(() => new Error('server error')));

      await expect(store.update('1', { title: 'New title' })).rejects.toThrow('server error');
      expect(store.tasks()).toEqual([original]);
    });
  });

  describe('remove', () => {
    it('removes the task immediately and records the activity once confirmed', async () => {
      const task = makeTask({ id: '1' });
      await seed([task]);
      apiSpy.delete.mockReturnValue(of(undefined));

      const promise = store.remove('1');
      expect(store.tasks()).toEqual([]); // optimistic

      await promise;
      expect(activitySpy.record).toHaveBeenCalledWith('deleted', task);
    });

    it('restores the task and rethrows if the request fails', async () => {
      const task = makeTask({ id: '1' });
      await seed([task]);
      apiSpy.delete.mockReturnValue(throwError(() => new Error('server error')));

      await expect(store.remove('1')).rejects.toThrow('server error');
      expect(store.tasks()).toEqual([task]);
    });
  });

  describe('move', () => {
    it('patches status/order optimistically, then reconciles and records "moved"', async () => {
      await seed([makeTask({ id: '1', status: 'todo', order: 0 })]);
      const moved = makeTask({ id: '1', status: 'in_progress', order: 3 });
      apiSpy.update.mockReturnValue(of(moved));

      const promise = store.move('1', 'in_progress', 3);
      expect(store.tasks()[0].status).toBe('in_progress'); // optimistic

      await promise;
      expect(apiSpy.update).toHaveBeenCalledWith('1', { status: 'in_progress', order: 3 });
      expect(store.tasks()).toEqual([moved]);
      expect(activitySpy.record).toHaveBeenCalledWith('moved', moved);
    });

    it('rolls back the move and rethrows if the request fails', async () => {
      const original = makeTask({ id: '1', status: 'todo', order: 0 });
      await seed([original]);
      apiSpy.update.mockReturnValue(throwError(() => new Error('server error')));

      await expect(store.move('1', 'in_progress', 3)).rejects.toThrow('server error');
      expect(store.tasks()).toEqual([original]);
    });
  });
});
