import { provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { en } from '../../core/i18n/translations/en';
import { Sidebar } from './sidebar';
import { NAV_ITEMS } from './nav-items';

describe('Sidebar', () => {
  it('renders every nav item label', async () => {
    await render(Sidebar, { providers: [provideRouter([])] });

    for (const item of NAV_ITEMS) {
      // Cast: every NAV_ITEMS key happens to resolve to a plain string, but
      // `TranslationKey` as a type also covers plural-map keys, which
      // getByText's Matcher type can't accept.
      expect(screen.getByText(en[item.labelKey] as string)).toBeInTheDocument();
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
