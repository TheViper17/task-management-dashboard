import { render, screen } from '@testing-library/angular';
import { PriorityChart } from './priority-chart';

describe('PriorityChart', () => {
  it('renders an sr-only breakdown matching the given counts', async () => {
    await render(PriorityChart, { inputs: { data: { high: 5, medium: 3, low: 2 } } });

    expect(screen.getByText('High: 5 tasks')).toBeInTheDocument();
    expect(screen.getByText('Medium: 3 tasks')).toBeInTheDocument();
    expect(screen.getByText('Low: 2 tasks')).toBeInTheDocument();
  });

  it('renders a canvas element', async () => {
    const { fixture } = await render(PriorityChart, {
      inputs: { data: { high: 0, medium: 0, low: 0 } },
    });
    expect((fixture.nativeElement as HTMLElement).querySelector('canvas')).not.toBeNull();
  });
});
