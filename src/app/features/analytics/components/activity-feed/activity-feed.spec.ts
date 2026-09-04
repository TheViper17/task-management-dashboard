import { render, screen } from '@testing-library/angular';
import type { ActivityEntry } from '../../../../core/models/activity.model';
import { ActivityFeed } from './activity-feed';

describe('ActivityFeed', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-09-04T12:00:00.000Z'));
  });

  afterEach(() => vi.useRealTimers());

  function makeEntry(overrides: Partial<ActivityEntry> = {}): ActivityEntry {
    return {
      id: 'activity-1',
      type: 'created',
      taskId: 'task-1',
      taskTitle: 'Design homepage',
      at: '2026-09-04T11:00:00.000Z',
      ...overrides,
    };
  }

  it('renders each entry as "You {verb} {task}" with a relative time', async () => {
    await render(ActivityFeed, { inputs: { entries: [makeEntry()] } });

    expect(screen.getByText('Design homepage')).toBeInTheDocument();
    expect(screen.getByText(/you created/i)).toBeInTheDocument();
    expect(screen.getByText('1 hour ago')).toBeInTheDocument();
  });

  it('shows the optional detail text when present', async () => {
    await render(ActivityFeed, {
      inputs: { entries: [makeEntry({ type: 'moved', detail: 'to In Progress' })] },
    });
    expect(screen.getByText('(to In Progress)')).toBeInTheDocument();
  });

  it('shows an empty state when there are no entries', async () => {
    await render(ActivityFeed, { inputs: { entries: [] } });
    expect(screen.getByText('No recent activity.')).toBeInTheDocument();
  });
});
