/**
 * Task domain models.
 *
 * String-literal unions instead of enums on purpose — the mock API
 * already speaks these exact lowercase strings, so a union round-trips
 * through JSON with no mapping layer, adds no runtime object (enums
 * compile to one), and tree-shakes cleanly.
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
 * isOverdue is on the wire, but callers should use the isTaskOverdue()
 * helper (task.utils.ts) instead of trusting it directly — the seed
 * data's values go stale the moment "today" moves on, so the store
 * recomputes it client-side on every read.
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
 * Fields a user supplies when creating a task. Kept separate from Task on
 * purpose — the entity carries server-owned fields (id, timestamps,
 * isOverdue, order) a create payload should never set directly, and
 * splitting the types makes that a compile error instead of something to
 * catch in review.
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

/**
 * Every field the API will accept in a PATCH — wider than UpdateTaskDto,
 * since it also allows order (board position), which is store-owned and
 * never shown on the create/edit form.
 */
export type TaskPatch = Partial<
  Pick<
    Task,
    'title' | 'description' | 'status' | 'priority' | 'dueDate' | 'assigneeId' | 'tags' | 'order'
  >
>;

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
