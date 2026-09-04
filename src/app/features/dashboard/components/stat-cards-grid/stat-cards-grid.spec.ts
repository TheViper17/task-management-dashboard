import { render, screen } from '@testing-library/angular';
import type { Statistic } from '../../../../core/models/statistic.model';
import { StatCardsGrid } from './stat-cards-grid';

function makeStatistics(): Statistic[] {
  return [
    {
      id: 'stat-001',
      title: 'Total Tasks',
      icon: '📊',
      value: 156,
      change: '+12',
      changeLabel: 'this week',
      changeType: 'positive',
      color: '#1976D2',
    },
    {
      id: 'stat-002',
      title: 'Completed',
      icon: '✅',
      value: 89,
      change: '+8',
      changeLabel: 'today',
      changeType: 'positive',
      color: '#388E3C',
    },
  ];
}

describe('StatCardsGrid', () => {
  it('renders one StatCard per statistic', async () => {
    await render(StatCardsGrid, { inputs: { statistics: makeStatistics() } });
    expect(screen.getByText('Total Tasks')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });
});
