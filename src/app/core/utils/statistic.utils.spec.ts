import type { Statistic } from '../models/statistic.model';
import type { TaskCounts } from './task.utils';
import { mergeLiveStatistics } from './statistic.utils';

function makeStat(title: string, value: number): Statistic {
  return {
    id: title,
    title,
    icon: '📊',
    value,
    change: '+1',
    changeLabel: 'this week',
    changeType: 'positive',
    color: '#1976D2',
  };
}

describe('mergeLiveStatistics', () => {
  const counts: TaskCounts = { total: 17, completed: 6, inProgress: 5, overdue: 3 };

  it('overrides value for each recognised title using the matching live count', () => {
    const seed = [
      makeStat('Total Tasks', 156),
      makeStat('Completed', 89),
      makeStat('In Progress', 42),
      makeStat('Overdue', 25),
    ];

    const merged = mergeLiveStatistics(seed, counts);

    expect(merged.map((s) => s.value)).toEqual([17, 6, 5, 3]);
  });

  it('preserves every other field unchanged', () => {
    const seed = [makeStat('Total Tasks', 156)];
    const [merged] = mergeLiveStatistics(seed, counts);
    expect(merged).toEqual(expect.objectContaining({ icon: '📊', change: '+1', color: '#1976D2' }));
  });

  it('leaves an unrecognised title untouched', () => {
    const seed = [makeStat('Something Else', 999)];
    expect(mergeLiveStatistics(seed, counts)[0].value).toBe(999);
  });
});
