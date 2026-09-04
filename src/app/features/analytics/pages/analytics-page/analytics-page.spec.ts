import { render, screen } from '@testing-library/angular';
import { ActivityStore } from '../../../../core/stores/activity.store';
import { TaskStore } from '../../../../core/stores/task.store';
import { AnalyticsPage } from './analytics-page';

describe('AnalyticsPage', () => {
  async function setup(): Promise<unknown> {
    return render(AnalyticsPage, {
      providers: [
        {
          provide: TaskStore,
          useValue: {
            priorityMix: () => ({ high: 5, medium: 3, low: 2 }),
            statusMix: () => ({ todo: 4, in_progress: 3, done: 3 }),
          },
        },
        { provide: ActivityStore, useValue: { entries: () => [] } },
      ],
    });
  }

  it('renders both chart cards and the activity card', async () => {
    await setup();
    expect(screen.getByText('Tasks by Priority')).toBeInTheDocument();
    expect(screen.getByText('Tasks by Status')).toBeInTheDocument();
    expect(screen.getByText('Recent Activity')).toBeInTheDocument();
  });

  it('passes the live priority/status mix through to the charts', async () => {
    await setup();
    expect(screen.getByText('High: 5 tasks')).toBeInTheDocument();
    expect(screen.getByText('To Do: 4 tasks')).toBeInTheDocument();
  });
});
