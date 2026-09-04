import type { Task } from '../models/task.model';
import { daysUntil } from './task.utils';

export type DueDateTone = 'overdue' | 'done' | 'default';

export interface DueDateInfo {
  icon: string;
  label: string;
  tone: DueDateTone;
}

/**
 * Describes a task's due-date state for display — the logic behind
 * `DueDateChip`. Pulled out as a pure function so every branch (overdue,
 * due today/tomorrow/in N days, completed today/yesterday/earlier) is unit
 * tested without mounting a component.
 */
export function describeDueDate(
  dueDate: string,
  status: Task['status'],
  completedAt?: string,
): DueDateInfo {
  if (status === 'done') {
    return { icon: 'check_circle', label: formatCompletedLabel(completedAt), tone: 'done' };
  }

  const days = daysUntil(dueDate);
  if (days < 0) {
    return { icon: 'warning', label: `Overdue by ${pluralDays(-days)}`, tone: 'overdue' };
  }
  if (days === 0) {
    return { icon: 'event', label: 'Due today', tone: 'default' };
  }
  if (days === 1) {
    return { icon: 'event', label: 'Due tomorrow', tone: 'default' };
  }
  return { icon: 'event', label: `Due in ${days} days`, tone: 'default' };
}

function pluralDays(count: number): string {
  return `${count} day${count === 1 ? '' : 's'}`;
}

function formatCompletedLabel(completedAt: string | undefined): string {
  if (!completedAt) return 'Completed';
  const days = daysUntil(completedAt.slice(0, 10));
  if (days === 0) return 'Completed today';
  if (days === -1) return 'Completed yesterday';
  return 'Completed';
}
