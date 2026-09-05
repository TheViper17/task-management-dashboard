import type { TranslateParams } from '../i18n/translation.model';
import type { TranslationKey } from '../i18n/translations/en';
import type { Task } from '../models/task.model';
import { daysUntil } from './task.utils';

/**
 * Converts a JS Date (the kind mat-datepicker's calendar produces, always
 * via new Date(year, month, day) in local time) to this app's wire
 * format, "YYYY-MM-DD". Reads local year/month/date getters rather than
 * date.toISOString().slice(0, 10) — toISOString() converts to UTC first,
 * which would quietly roll the date back a day for anyone west of UTC.
 */
export function toIsoDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parses the app's "YYYY-MM-DD" format into a local-midnight Date — the
 * inverse of toIsoDateString(). Not new Date(iso), on purpose: that parses
 * as UTC midnight per spec, which this app's own Date getters (and
 * mat-datepicker's calendar) would then read back as the previous day for
 * anyone west of UTC.
 */
export function parseIsoDateLocal(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export type DueDateTone = 'overdue' | 'done' | 'default';

/**
 * A translation key + params, not a formatted string — this file is
 * plain, framework-agnostic code (no inject()), so it gets tested against
 * which message and what data, not final English wording. The caller
 * (DueDateChip/ActivityFeed) resolves the actual text via
 * i18n.translate(key, params).
 */
export interface DueDateInfo {
  icon: string;
  key: TranslationKey;
  params?: TranslateParams;
  tone: DueDateTone;
}

/**
 * Describes a task's due-date state for display — the logic behind
 * DueDateChip. Pulled out as a plain function so every branch (overdue,
 * due today/tomorrow/in N days, completed today/yesterday/earlier) gets
 * tested without mounting a component.
 */
export function describeDueDate(
  dueDate: string,
  status: Task['status'],
  completedAt?: string,
): DueDateInfo {
  if (status === 'done') {
    return { icon: 'check_circle', tone: 'done', ...describeCompleted(completedAt) };
  }

  const days = daysUntil(dueDate);
  if (days < 0) {
    return { icon: 'warning', key: 'dueDate.overdueBy', params: { count: -days }, tone: 'overdue' };
  }
  if (days === 0) {
    return { icon: 'event', key: 'dueDate.dueToday', tone: 'default' };
  }
  if (days === 1) {
    return { icon: 'event', key: 'dueDate.dueTomorrow', tone: 'default' };
  }
  return { icon: 'event', key: 'dueDate.dueInDays', params: { count: days }, tone: 'default' };
}

function describeCompleted(completedAt: string | undefined): Pick<DueDateInfo, 'key' | 'params'> {
  if (!completedAt) return { key: 'common.completed' };
  const days = daysUntil(completedAt.slice(0, 10));
  if (days === 0) return { key: 'dueDate.completedToday' };
  if (days === -1) return { key: 'dueDate.completedYesterday' };
  return { key: 'common.completed' };
}

const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;
const WEEK_MS = 7 * DAY_MS;

/** A translation key + params describing a relative time — see `DueDateInfo`'s doc comment. */
export interface RelativeTimeInfo {
  key: TranslationKey;
  params?: TranslateParams;
}

/**
 * Describes an ISO datetime as "N minutes/hours/days/weeks ago" for the
 * activity feed. Takes now as a parameter (defaulting to new Date()) just
 * so tests can pass a fixed instant instead of mocking the clock.
 */
export function describeRelativeTime(iso: string, now: Date = new Date()): RelativeTimeInfo {
  const diffMs = Math.max(0, now.getTime() - new Date(iso).getTime());

  if (diffMs < MINUTE_MS) return { key: 'time.justNow' };
  if (diffMs < HOUR_MS) {
    return { key: 'time.minutesAgo', params: { count: Math.floor(diffMs / MINUTE_MS) } };
  }
  if (diffMs < DAY_MS) {
    return { key: 'time.hoursAgo', params: { count: Math.floor(diffMs / HOUR_MS) } };
  }
  if (diffMs < WEEK_MS) {
    return { key: 'time.daysAgo', params: { count: Math.floor(diffMs / DAY_MS) } };
  }
  return { key: 'time.weeksAgo', params: { count: Math.floor(diffMs / WEEK_MS) } };
}
