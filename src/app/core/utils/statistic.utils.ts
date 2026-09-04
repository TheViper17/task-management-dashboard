import type { Statistic } from '../models/statistic.model';
import type { TaskCounts } from './task.utils';

const VALUE_KEY_BY_TITLE: Record<string, keyof TaskCounts> = {
  'Total Tasks': 'total',
  Completed: 'completed',
  'In Progress': 'inProgress',
  Overdue: 'overdue',
};

/**
 * Overrides each stat card's `value` with the live count derived from the
 * current task list, keeping the icon/change/changeLabel/color from the
 * fetched statistics (the mock API's seed numbers are static and don't
 * track create/delete — the delta text is flavour we can't derive, but the
 * headline number should always be honest).
 */
export function mergeLiveStatistics(
  seedStatistics: readonly Statistic[],
  counts: TaskCounts,
): Statistic[] {
  return seedStatistics.map((stat) => {
    const key = VALUE_KEY_BY_TITLE[stat.title];
    return key ? { ...stat, value: counts[key] } : stat;
  });
}
