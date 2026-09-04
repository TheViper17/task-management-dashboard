import type { CdkDragDrop } from '@angular/cdk/drag-drop';
import type { Task } from '../../../core/models/task.model';
import {
  boardColumnListId,
  computeTaskOrderPatches,
  statusFromBoardColumnListId,
} from './board-drag-drop.utils';

describe('boardColumnListId / statusFromBoardColumnListId', () => {
  it('builds a stable, prefixed id per status', () => {
    expect(boardColumnListId('todo')).toBe('board-column-todo');
    expect(boardColumnListId('in_progress')).toBe('board-column-in_progress');
    expect(boardColumnListId('done')).toBe('board-column-done');
  });

  it('round-trips back to the original status', () => {
    for (const status of ['todo', 'in_progress', 'done'] as const) {
      expect(statusFromBoardColumnListId(boardColumnListId(status))).toBe(status);
    }
  });
});

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'task-1',
    title: 't',
    description: 'd',
    status: 'todo',
    priority: 'low',
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

/** Builds a minimal CdkDragDrop-shaped object — only the fields computeTaskOrderPatches reads. */
function makeDropEvent(options: {
  previousContainerId: string;
  previousData: Task[];
  containerId: string;
  containerData: Task[];
  previousIndex: number;
  currentIndex: number;
  sameContainer?: boolean;
}): CdkDragDrop<readonly Task[]> {
  const container = { id: options.containerId, data: options.containerData };
  const previousContainer = options.sameContainer
    ? container
    : { id: options.previousContainerId, data: options.previousData };

  return {
    previousIndex: options.previousIndex,
    currentIndex: options.currentIndex,
    item: { data: options.previousData[options.previousIndex] },
    container,
    previousContainer,
    isPointerOverContainer: true,
    distance: { x: 0, y: 0 },
    dropPoint: { x: 0, y: 0 },
    event: new MouseEvent('mouseup'),
  } as unknown as CdkDragDrop<readonly Task[]>;
}

describe('computeTaskOrderPatches', () => {
  it('reorders within a column and patches only the entries whose order changed', () => {
    const t1 = makeTask({ id: 't1', status: 'todo', order: 0 });
    const t2 = makeTask({ id: 't2', status: 'todo', order: 1 });
    const t3 = makeTask({ id: 't3', status: 'todo', order: 2 });

    const event = makeDropEvent({
      previousContainerId: 'board-column-todo',
      previousData: [t1, t2, t3],
      containerId: 'board-column-todo',
      containerData: [t1, t2, t3],
      previousIndex: 0,
      currentIndex: 2,
      sameContainer: true,
    });

    // moveItemInArray(0 -> 2) on [t1,t2,t3] => [t2,t3,t1]: every task's
    // index shifted from its original order, so all three need patching —
    // t2 order 1->0, t3 order 2->1, t1 order 0->2.
    expect(computeTaskOrderPatches(event)).toEqual([
      { taskId: 't2', status: 'todo', order: 0 },
      { taskId: 't3', status: 'todo', order: 1 },
      { taskId: 't1', status: 'todo', order: 2 },
    ]);
  });

  it('returns no patches when a drop leaves every order unchanged', () => {
    const t1 = makeTask({ id: 't1', status: 'todo', order: 0 });
    const t2 = makeTask({ id: 't2', status: 'todo', order: 1 });

    // Dropped back in its original slot.
    const event = makeDropEvent({
      previousContainerId: 'board-column-todo',
      previousData: [t1, t2],
      containerId: 'board-column-todo',
      containerData: [t1, t2],
      previousIndex: 0,
      currentIndex: 0,
      sameContainer: true,
    });

    expect(computeTaskOrderPatches(event)).toEqual([]);
  });

  it('moves a task to a different column and renumbers both columns', () => {
    const t1 = makeTask({ id: 't1', status: 'todo', order: 0 });
    const t2 = makeTask({ id: 't2', status: 'todo', order: 1 });
    const d1 = makeTask({ id: 'd1', status: 'done', order: 0 });

    const event = makeDropEvent({
      previousContainerId: 'board-column-todo',
      previousData: [t1, t2],
      containerId: 'board-column-done',
      containerData: [d1],
      previousIndex: 0,
      currentIndex: 0,
    });

    const patches = computeTaskOrderPatches(event);

    // Source (todo) loses t1: t2 shifts from order 1 -> 0.
    expect(patches).toContainEqual({ taskId: 't2', status: 'todo', order: 0 });
    // Target (done) gains t1 at index 0 — status todo -> done. d1 shifts to 1.
    expect(patches).toContainEqual({ taskId: 't1', status: 'done', order: 0 });
    expect(patches).toContainEqual({ taskId: 'd1', status: 'done', order: 1 });
    expect(patches).toHaveLength(3);
  });

  it('drops a task at the end of an empty column', () => {
    const t1 = makeTask({ id: 't1', status: 'todo', order: 0 });

    const event = makeDropEvent({
      previousContainerId: 'board-column-todo',
      previousData: [t1],
      containerId: 'board-column-done',
      containerData: [],
      previousIndex: 0,
      currentIndex: 0,
    });

    expect(computeTaskOrderPatches(event)).toEqual([{ taskId: 't1', status: 'done', order: 0 }]);
  });
});
