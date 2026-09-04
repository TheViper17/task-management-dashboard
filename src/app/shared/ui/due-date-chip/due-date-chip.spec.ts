import { render, screen } from '@testing-library/angular';
import { DueDateChip } from './due-date-chip';

describe('DueDateChip', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-04T12:00:00.000Z'));
  });

  afterEach(() => vi.useRealTimers());

  it('shows an overdue label with the overdue tone class', async () => {
    const { fixture } = await render(DueDateChip, {
      inputs: { dueDate: '2026-09-01', status: 'todo' },
    });
    expect(screen.getByText(/Overdue by 3 days/)).toBeInTheDocument();
    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector('.due-date-chip--overdue')).not.toBeNull();
  });

  it('shows "Due in N days" with the default tone for a future due date', async () => {
    const { fixture } = await render(DueDateChip, {
      inputs: { dueDate: '2026-09-09', status: 'todo' },
    });
    expect(screen.getByText(/Due in 5 days/)).toBeInTheDocument();
    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector('.due-date-chip--default')).not.toBeNull();
  });

  it('shows "Completed today" with the done tone for a done task', async () => {
    const { fixture } = await render(DueDateChip, {
      inputs: { dueDate: '2026-09-01', status: 'done', completedAt: '2026-09-04T09:00:00.000Z' },
    });
    expect(screen.getByText(/Completed today/)).toBeInTheDocument();
    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector('.due-date-chip--done')).not.toBeNull();
  });
});
