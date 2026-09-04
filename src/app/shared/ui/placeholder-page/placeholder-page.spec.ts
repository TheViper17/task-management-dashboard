import { render, screen } from '@testing-library/angular';
import { PlaceholderPage } from './placeholder-page';

describe('PlaceholderPage', () => {
  it('renders the given title', async () => {
    await render(PlaceholderPage, { inputs: { title: 'Team' } });
    expect(screen.getByRole('heading', { name: 'Team' })).toBeInTheDocument();
  });

  it('defaults the subtitle to "Coming soon."', async () => {
    await render(PlaceholderPage, { inputs: { title: 'Team' } });
    expect(screen.getByText('Coming soon.')).toBeInTheDocument();
  });

  it('renders a custom subtitle when provided', async () => {
    await render(PlaceholderPage, { inputs: { title: 'Team', subtitle: 'Almost there.' } });
    expect(screen.getByText('Almost there.')).toBeInTheDocument();
  });
});
