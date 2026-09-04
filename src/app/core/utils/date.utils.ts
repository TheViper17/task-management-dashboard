import type { Task } from '../models/task.model';
import { daysUntil } from './task.utils';

/**
 * Converts a JS `Date` (as produced by `mat-datepicker`'s calendar, which
 * always constructs dates via `new Date(year, month, day)` in local time) to
 * the app's wire format, `"YYYY-MM-DD"`. Deliberately reads local
 * year/month/date getters rather than `date.toISOString().slice(0, 10)` —
 * `toISOString()` converts to UTC first, which would silently roll the date
 * back a day for anyone west of UTC.
 */
export function toIsoDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parses the app's `"YYYY-MM-DD"` wire format into a local-midnight `Date`,
 * the inverse of `toIsoDateString()`. Deliberately not `new Date(iso)` —
 * that parses as UTC midnight per spec, which display code (this app's own
 * `Date`-based getters, and mat-datepicker's calendar) would then read back
 * as the previous day for anyone west of UTC.
 */
export function parseIsoDateLocal(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day);
}

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
