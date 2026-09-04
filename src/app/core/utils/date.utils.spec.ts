import { describeDueDate } from './date.utils';

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
