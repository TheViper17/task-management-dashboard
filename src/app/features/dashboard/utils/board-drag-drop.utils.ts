import type { CdkDragDrop } from '@angular/cdk/drag-drop';
import { moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import type { Task, TaskStatus } from '../../../core/models/task.model';

const PREFIX = 'board-column-';

/**
 * Each kanban column is a cdkDropList whose id encodes its status
 * (board-column-todo, etc). Centralised here rather than built
 * separately in BoardColumn and DashboardPage, so the two can never
 * drift out of sync.
 */
export function boardColumnListId(status: TaskStatus): string {
  return `${PREFIX}${status}`;
}

/** Inverse of `boardColumnListId` — reads the status back off a drop list's id. */
export function statusFromBoardColumnListId(id: string): TaskStatus {
  return id.slice(PREFIX.length) as TaskStatus;
}

export interface TaskOrderPatch {
  taskId: string;
  status: TaskStatus;
  order: number;
}

/**
 * Computes the minimal set of status/order patches a drag-drop event
 * needs. A plain function (no store, no component), so the reorder math —
 * the part actually worth testing — can be checked without a fake CDK
 * pointer gesture, which jsdom can't produce anyway.
 *
 * Same-column reorder and cross-column move both boil down to the same
 * thing: recompute the affected column's final order and patch only what
 * changed. Moving one card in a 3-card column doesn't need 3 PATCH
 * requests, just the cards whose status or order actually differ from
 * what's already persisted.
 */
export function computeTaskOrderPatches(event: CdkDragDrop<readonly Task[]>): TaskOrderPatch[] {
  const targetStatus = statusFromBoardColumnListId(event.container.id);

  if (event.previousContainer === event.container) {
    const tasks = [...event.container.data];
    moveItemInArray(tasks, event.previousIndex, event.currentIndex);
    return diffOrder(tasks, targetStatus);
  }

  const sourceStatus = statusFromBoardColumnListId(event.previousContainer.id);
  const sourceTasks = [...event.previousContainer.data];
  const targetTasks = [...event.container.data];
  transferArrayItem(sourceTasks, targetTasks, event.previousIndex, event.currentIndex);

  return [...diffOrder(sourceTasks, sourceStatus), ...diffOrder(targetTasks, targetStatus)];
}

function diffOrder(tasks: readonly Task[], status: TaskStatus): TaskOrderPatch[] {
  const patches: TaskOrderPatch[] = [];
  tasks.forEach((task, order) => {
    if (task.status === status && task.order === order) return; // unchanged
    patches.push({ taskId: task.id, status, order });
  });
  return patches;
}
