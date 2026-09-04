import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { Header } from './header';

describe('Header', () => {
  it('renders the brand title', async () => {
    await render(Header);
    expect(screen.getByText('Task Manager')).toBeInTheDocument();
  });

  it('emits searchChange with the current value as the user types', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(Header);
    const emitted: string[] = [];
    fixture.componentInstance.searchChange.subscribe((v: string) => emitted.push(v));

    await user.type(screen.getByRole('searchbox'), 'bug');

    expect(emitted).toEqual(['b', 'bu', 'bug']);
  });

  it('emits notificationsClick when the bell button is clicked', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(Header);
    const clicks: void[] = [];
    fixture.componentInstance.notificationsClick.subscribe(() => clicks.push(undefined));

    await user.click(screen.getByRole('button', { name: 'Notifications' }));

    expect(clicks).toHaveLength(1);
  });

  it('shows a badge only when notificationCount is greater than zero', async () => {
    const { rerender } = await render(Header, { inputs: { notificationCount: 0 } });
    expect(screen.queryByText('3')).not.toBeInTheDocument();

    await rerender({ inputs: { notificationCount: 3 } });
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('shows the current user avatar only when initials are provided', async () => {
    const { rerender } = await render(Header, { inputs: { currentUserInitials: null } });
    expect(screen.queryByText('JD')).not.toBeInTheDocument();

    await rerender({ inputs: { currentUserInitials: 'JD' } });
    expect(screen.getByText('JD')).toBeInTheDocument();
  });
});
