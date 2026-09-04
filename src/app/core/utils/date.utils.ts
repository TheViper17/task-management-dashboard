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

const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;
const WEEK_MS = 7 * DAY_MS;

/**
 * Formats an ISO datetime as "N minutes/hours/days/weeks ago" for the
 * activity feed. Takes `now` as a parameter (defaulting to `new Date()`)
 * purely so tests can pass a fixed instant instead of mocking the clock.
 */
export function formatRelativeTime(iso: string, now: Date = new Date()): string {
  const diffMs = Math.max(0, now.getTime() - new Date(iso).getTime());

  if (diffMs < MINUTE_MS) return 'just now';
  if (diffMs < HOUR_MS) return pluralUnit(Math.floor(diffMs / MINUTE_MS), 'minute');
  if (diffMs < DAY_MS) return pluralUnit(Math.floor(diffMs / HOUR_MS), 'hour');
  if (diffMs < WEEK_MS) return pluralUnit(Math.floor(diffMs / DAY_MS), 'day');
  return pluralUnit(Math.floor(diffMs / WEEK_MS), 'week');
}

function pluralUnit(count: number, unit: string): string {
  return `${count} ${unit}${count === 1 ? '' : 's'} ago`;
}
