import { describeDueDate, describeRelativeTime } from './date.utils';

describe('describeDueDate', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-04T12:00:00.000Z'));
  });

  afterEach(() => vi.useRealTimers());

  it('reports "overdueBy" with the day count for a past due date that is not done', () => {
    expect(describeDueDate('2026-09-01', 'todo')).toEqual(
      expect.objectContaining({ key: 'dueDate.overdueBy', params: { count: 3 }, tone: 'overdue' }),
    );
  });

  it('reports a count of 1 when overdue by exactly one day', () => {
    expect(describeDueDate('2026-09-03', 'in_progress')).toEqual(
      expect.objectContaining({ key: 'dueDate.overdueBy', params: { count: 1 } }),
    );
  });

  it('reports "dueToday" when the due date is today', () => {
    expect(describeDueDate('2026-09-04', 'todo')).toEqual(
      expect.objectContaining({ key: 'dueDate.dueToday', tone: 'default' }),
    );
  });

  it('reports "dueTomorrow" when the due date is one day out', () => {
    expect(describeDueDate('2026-09-05', 'todo')).toEqual(
      expect.objectContaining({ key: 'dueDate.dueTomorrow' }),
    );
  });

  it('reports "dueInDays" with the day count further out', () => {
    expect(describeDueDate('2026-09-09', 'todo')).toEqual(
      expect.objectContaining({ key: 'dueDate.dueInDays', params: { count: 5 } }),
    );
  });

  it('reports "completedToday" for a done task completed today', () => {
    expect(describeDueDate('2026-09-01', 'done', '2026-09-04T09:00:00.000Z')).toEqual(
      expect.objectContaining({ key: 'dueDate.completedToday', tone: 'done' }),
    );
  });

  it('reports "completedYesterday" for a done task completed yesterday', () => {
    expect(describeDueDate('2026-09-01', 'done', '2026-09-03T09:00:00.000Z')).toEqual(
      expect.objectContaining({ key: 'dueDate.completedYesterday' }),
    );
  });

  it('falls back to the generic "completed" key for a done task completed earlier, or with no completedAt', () => {
    expect(describeDueDate('2026-09-01', 'done', '2026-08-20T09:00:00.000Z')).toEqual(
      expect.objectContaining({ key: 'common.completed' }),
    );
    expect(describeDueDate('2026-09-01', 'done')).toEqual(
      expect.objectContaining({ key: 'common.completed' }),
    );
  });

  it('a done task is never overdue, even with a long-past due date', () => {
    expect(describeDueDate('2020-01-01', 'done', '2026-09-04T09:00:00.000Z').tone).toBe('done');
  });
});

describe('describeRelativeTime', () => {
  const now = new Date('2026-09-04T12:00:00.000Z');

  it('reports "justNow" for anything under a minute old', () => {
    expect(describeRelativeTime('2026-09-04T11:59:30.000Z', now)).toEqual({
      key: 'time.justNow',
    });
  });

  it('reports minutes with the count, once past 60 minutes', () => {
    expect(describeRelativeTime('2026-09-04T11:59:00.000Z', now)).toEqual({
      key: 'time.minutesAgo',
      params: { count: 1 },
    });
    expect(describeRelativeTime('2026-09-04T11:45:00.000Z', now)).toEqual({
      key: 'time.minutesAgo',
      params: { count: 15 },
    });
  });

  it('reports hours once past 60 minutes', () => {
    expect(describeRelativeTime('2026-09-04T11:00:00.000Z', now)).toEqual({
      key: 'time.hoursAgo',
      params: { count: 1 },
    });
    expect(describeRelativeTime('2026-09-04T09:00:00.000Z', now)).toEqual({
      key: 'time.hoursAgo',
      params: { count: 3 },
    });
  });

  it('reports days once past 24 hours', () => {
    expect(describeRelativeTime('2026-09-03T12:00:00.000Z', now)).toEqual({
      key: 'time.daysAgo',
      params: { count: 1 },
    });
    expect(describeRelativeTime('2026-09-01T12:00:00.000Z', now)).toEqual({
      key: 'time.daysAgo',
      params: { count: 3 },
    });
  });

  it('reports weeks once past 7 days', () => {
    expect(describeRelativeTime('2026-08-28T12:00:00.000Z', now)).toEqual({
      key: 'time.weeksAgo',
      params: { count: 1 },
    });
    expect(describeRelativeTime('2026-08-14T12:00:00.000Z', now)).toEqual({
      key: 'time.weeksAgo',
      params: { count: 3 },
    });
  });

  it('never reports a negative duration for a timestamp slightly in the future (clock skew)', () => {
    expect(describeRelativeTime('2026-09-04T12:00:05.000Z', now)).toEqual({
      key: 'time.justNow',
    });
  });
});
