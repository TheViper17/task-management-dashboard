import { render, screen } from '@testing-library/angular';
import type { Statistic } from '../../../../core/models/statistic.model';
import { StatCard } from './stat-card';

function makeStatistic(overrides: Partial<Statistic> = {}): Statistic {
  return {
    id: 'stat-001',
    title: 'Total Tasks',
    icon: '📊',
    value: 156,
    change: '+12',
    changeLabel: 'this week',
    changeType: 'positive',
    color: '#1976D2',
    ...overrides,
  };
}

describe('StatCard', () => {
  it('renders the title and value', async () => {
    await render(StatCard, { inputs: { statistic: makeStatistic() } });
    expect(screen.getByText('Total Tasks')).toBeInTheDocument();
    expect(screen.getByText('156')).toBeInTheDocument();
  });

  it('combines change + changeLabel into the delta line', async () => {
    await render(StatCard, { inputs: { statistic: makeStatistic() } });
    expect(screen.getByText('+12 this week')).toBeInTheDocument();
  });

  it('shows only the changeLabel when change is "0"', async () => {
    await render(StatCard, {
      inputs: { statistic: makeStatistic({ change: '0', changeLabel: 'Same as yesterday' }) },
    });
    expect(screen.getByText('Same as yesterday')).toBeInTheDocument();
  });

  it('falls back to the raw title/changeLabel text for an id it does not recognise', async () => {
    // title/changeLabel are free-text from the (mock) statistics API, not
    // this app's own template — an id outside the known four should
    // degrade to whatever the "backend" sent, not blank out.
    await render(StatCard, {
      inputs: {
        statistic: makeStatistic({
          id: 'stat-999',
          title: 'Custom Metric',
          changeLabel: 'this quarter',
        }),
      },
    });
    expect(screen.getByText('Custom Metric')).toBeInTheDocument();
    expect(screen.getByText('+12 this quarter')).toBeInTheDocument();
  });

  it('applies the delta tone class matching changeType', async () => {
    const { fixture } = await render(StatCard, {
      inputs: { statistic: makeStatistic({ changeType: 'negative' }) },
    });
    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector('.stat-card__delta--negative')).not.toBeNull();
  });
});
