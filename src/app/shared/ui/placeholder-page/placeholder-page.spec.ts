import { render, screen } from '@testing-library/angular';
import { PlaceholderPage } from './placeholder-page';

describe('PlaceholderPage', () => {
  it('renders the translated title for the given key', async () => {
    await render(PlaceholderPage, { inputs: { titleKey: 'nav.team' } });
    expect(screen.getByRole('heading', { name: 'Team' })).toBeInTheDocument();
  });

  it('defaults the subtitle to "Coming soon."', async () => {
    await render(PlaceholderPage, { inputs: { titleKey: 'nav.team' } });
    expect(screen.getByText('Coming soon.')).toBeInTheDocument();
  });

  it('renders a custom subtitle key when provided', async () => {
    // Any distinct real key proves the override path — its own meaning as
    // a "subtitle" is irrelevant here, only that it's not the default.
    await render(PlaceholderPage, {
      inputs: { titleKey: 'nav.team', subtitleKey: 'nav.dashboard' },
    });
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('renders no subtitle at all when subtitleKey is null', async () => {
    // The "page not found" route's actual usage — app.routes.ts.
    await render(PlaceholderPage, {
      inputs: { titleKey: 'placeholder.notFoundTitle', subtitleKey: null },
    });
    expect(screen.queryByText('Coming soon.')).not.toBeInTheDocument();
  });
});
