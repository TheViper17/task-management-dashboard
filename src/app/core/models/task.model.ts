/**
 * Task domain models.
 *
 * String-literal unions are used instead of TypeScript `enum`s deliberately:
 * the mock API already speaks these exact lowercase strings, so a union
 * round-trips through JSON with zero mapping layer, produces no runtime
 * object (enums compile to one), and tree-shakes cleanly.
 */

export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export const TASK_STATUSES: readonly TaskStatus[] = ['todo', 'in_progress', 'done'];
export const TASK_PRIORITIES: readonly TaskPriority[] = ['low', 'medium', 'high'];

export interface Assignee {
  id: string;
  name: string;
  avatar: string;
  email: string;
}

/**
 * A task as returned by the API.
 *
 * `isOverdue` is present on the wire, but callers should prefer the
 * `isTaskOverdue()` helper (see task.utils.ts) over trusting this field
 * directly — the mock dataset's seed values go stale the moment "today"
 * moves on, so the store recomputes it client-side on every read.
 */
export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string; // ISO date, e.g. "2026-09-10"
  isOverdue: boolean;
  completedAt?: string;
  assignee: Assignee;
  assigneeId: string;
  tags: string[];
  order: number; // stable sort key within its status column
  createdAt: string;
  updatedAt: string;
}

/**
 * Fields a user supplies when creating a task. Deliberately a separate type
 * from `Task`: the entity carries server-owned fields (id, timestamps,
 * isOverdue, order) that a create payload must never set directly — keeping
 * them apart makes that a compile error instead of a code-review comment.
 */
export interface CreateTaskDto {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  assigneeId: string;
  tags: string[];
}

export type UpdateTaskDto = Partial<CreateTaskDto>;

export interface TaskFilters {
  status: TaskStatus | 'all';
  priority: TaskPriority | 'all';
  /** An assignee id, or the sentinel `'all'` meaning "no assignee filter". */
  assigneeId: string;
}

export const DEFAULT_TASK_FILTERS: TaskFilters = {
  status: 'all',
  priority: 'all',
  assigneeId: 'all',
};
