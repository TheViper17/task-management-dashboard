import { provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { Sidebar } from './sidebar';
import { NAV_ITEMS } from './nav-items';

describe('Sidebar', () => {
  it('renders every nav item label', async () => {
    await render(Sidebar, { providers: [provideRouter([])] });

    for (const item of NAV_ITEMS) {
      expect(screen.getByText(item.label)).toBeInTheDocument();
    }
  });

  it('links each nav item to its route', async () => {
    await render(Sidebar, { providers: [provideRouter([])] });

    const dashboardLink = screen.getByText('Dashboard').closest('a');
    expect(dashboardLink).toHaveAttribute('href', '/dashboard');
  });

  it('emits newTaskClick when the "New Task" button is clicked', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(Sidebar, { providers: [provideRouter([])] });
    const clicks: void[] = [];
    fixture.componentInstance.newTaskClick.subscribe(() => clicks.push(undefined));

    await user.click(screen.getByRole('button', { name: /new task/i }));

    expect(clicks).toHaveLength(1);
  });
});
