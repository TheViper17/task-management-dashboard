import { describeDueDate, formatRelativeTime } from './date.utils';

describe('describeDueDate', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-04T12:00:00.000Z'));
  });

  afterEach(() => vi.useRealTimers());

  it('reports "Overdue by N days" for a past due date that is not done', () => {
    expect(describeDueDate('2026-09-01', 'todo')).toEqual(
      expect.objectContaining({ label: 'Overdue by 3 days', tone: 'overdue' }),
    );
  });

  it('uses singular "day" when overdue by exactly one day', () => {
    expect(describeDueDate('2026-09-03', 'in_progress').label).toBe('Overdue by 1 day');
  });

  it('reports "Due today" when the due date is today', () => {
    expect(describeDueDate('2026-09-04', 'todo')).toEqual(
      expect.objectContaining({ label: 'Due today', tone: 'default' }),
    );
  });

  it('reports "Due tomorrow" when the due date is one day out', () => {
    expect(describeDueDate('2026-09-05', 'todo').label).toBe('Due tomorrow');
  });

  it('reports "Due in N days" further out', () => {
    expect(describeDueDate('2026-09-09', 'todo').label).toBe('Due in 5 days');
  });

  it('reports "Completed today" for a done task completed today', () => {
    expect(describeDueDate('2026-09-01', 'done', '2026-09-04T09:00:00.000Z')).toEqual(
      expect.objectContaining({ label: 'Completed today', tone: 'done' }),
    );
  });

  it('reports "Completed yesterday" for a done task completed yesterday', () => {
    expect(describeDueDate('2026-09-01', 'done', '2026-09-03T09:00:00.000Z').label).toBe(
      'Completed yesterday',
    );
  });

  it('falls back to "Completed" for a done task completed earlier, or with no completedAt', () => {
    expect(describeDueDate('2026-09-01', 'done', '2026-08-20T09:00:00.000Z').label).toBe(
      'Completed',
    );
    expect(describeDueDate('2026-09-01', 'done').label).toBe('Completed');
  });

  it('a done task is never overdue, even with a long-past due date', () => {
    expect(describeDueDate('2020-01-01', 'done', '2026-09-04T09:00:00.000Z').tone).toBe('done');
  });
});

describe('formatRelativeTime', () => {
  const now = new Date('2026-09-04T12:00:00.000Z');

  it('reports "just now" for anything under a minute old', () => {
    expect(formatRelativeTime('2026-09-04T11:59:30.000Z', now)).toBe('just now');
  });

  it('reports minutes, pluralised correctly', () => {
    expect(formatRelativeTime('2026-09-04T11:59:00.000Z', now)).toBe('1 minute ago');
    expect(formatRelativeTime('2026-09-04T11:45:00.000Z', now)).toBe('15 minutes ago');
  });

  it('reports hours once past 60 minutes', () => {
    expect(formatRelativeTime('2026-09-04T11:00:00.000Z', now)).toBe('1 hour ago');
    expect(formatRelativeTime('2026-09-04T09:00:00.000Z', now)).toBe('3 hours ago');
  });

  it('reports days once past 24 hours', () => {
    expect(formatRelativeTime('2026-09-03T12:00:00.000Z', now)).toBe('1 day ago');
    expect(formatRelativeTime('2026-09-01T12:00:00.000Z', now)).toBe('3 days ago');
  });

  it('reports weeks once past 7 days', () => {
    expect(formatRelativeTime('2026-08-28T12:00:00.000Z', now)).toBe('1 week ago');
    expect(formatRelativeTime('2026-08-14T12:00:00.000Z', now)).toBe('3 weeks ago');
  });

  it('never reports a negative duration for a timestamp slightly in the future (clock skew)', () => {
    expect(formatRelativeTime('2026-09-04T12:00:05.000Z', now)).toBe('just now');
  });
});
