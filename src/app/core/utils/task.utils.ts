import type { Task, TaskFilters, TaskPriority, TaskStatus } from '../models/task.model';

/**
 * Whether a task is overdue *right now*, recomputed rather than trusted from
 * the API. The mock dataset seeds `isOverdue` at generation time; by the
 * time a reviewer opens the app "today" has moved on, so the seeded value
 * can be wrong. Deriving it here means the UI is always correct regardless
 * of when it's viewed.
 */
export function isTaskOverdue(task: Pick<Task, 'dueDate' | 'status'>): boolean {
  if (task.status === 'done') return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(task.dueDate);
  due.setHours(0, 0, 0, 0);
  return due.getTime() < today.getTime();
}

/** Whole-day distance from today to `dueDate` (negative = in the past). */
export function daysUntil(dueDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  return Math.round((due.getTime() - today.getTime()) / 86_400_000);
}

/**
 * Applies the board's search + filter state to a task list.
 * Search matches title and description, case-insensitively.
 */
export function filterTasks(tasks: readonly Task[], filters: TaskFilters, search: string): Task[] {
  const query = search.trim().toLowerCase();

  return tasks.filter((task) => {
    if (filters.status !== 'all' && task.status !== filters.status) return false;
    if (filters.priority !== 'all' && task.priority !== filters.priority) return false;
    if (filters.assigneeId !== 'all' && task.assigneeId !== filters.assigneeId) return false;
    if (!query) return true;
    return (
      task.title.toLowerCase().includes(query) || task.description.toLowerCase().includes(query)
    );
  });
}

/** Groups tasks by status into the three kanban columns, each sorted by `order`. */
export function groupByStatus(tasks: readonly Task[]): Record<TaskStatus, Task[]> {
  const groups: Record<TaskStatus, Task[]> = { todo: [], in_progress: [], done: [] };
  for (const task of tasks) {
    groups[task.status].push(task);
  }
  for (const status of Object.keys(groups) as TaskStatus[]) {
    groups[status] = [...groups[status]].sort((a, b) => a.order - b.order);
  }
  return groups;
}

/** Counts tasks per priority — feeds the priority distribution chart. */
export function countByPriority(tasks: readonly Task[]): Record<TaskPriority, number> {
  const counts: Record<TaskPriority, number> = { low: 0, medium: 0, high: 0 };
  for (const task of tasks) counts[task.priority]++;
  return counts;
}

/** Counts tasks per status — feeds the status distribution chart. */
export function countByStatus(tasks: readonly Task[]): Record<TaskStatus, number> {
  const counts: Record<TaskStatus, number> = { todo: 0, in_progress: 0, done: 0 };
  for (const task of tasks) counts[task.status]++;
  return counts;
}

export interface TaskCounts {
  total: number;
  completed: number;
  inProgress: number;
  overdue: number;
}

/** Live task counts for the four stat cards, derived from the current task list. */
export function deriveTaskCounts(tasks: readonly Task[]): TaskCounts {
  let completed = 0;
  let inProgress = 0;
  let overdue = 0;

  for (const task of tasks) {
    if (task.status === 'done') completed++;
    else if (task.status === 'in_progress') inProgress++;
    if (isTaskOverdue(task)) overdue++;
  }

  return { total: tasks.length, completed, inProgress, overdue };
}
