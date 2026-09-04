import { render, screen } from '@testing-library/angular';
import { StatusChart } from './status-chart';

describe('StatusChart', () => {
  it('renders an sr-only breakdown matching the given counts', async () => {
    await render(StatusChart, {
      inputs: { data: { todo: 6, in_progress: 5, done: 6 } },
    });

    expect(screen.getByText('To Do: 6 tasks')).toBeInTheDocument();
    expect(screen.getByText('In Progress: 5 tasks')).toBeInTheDocument();
    expect(screen.getByText('Done: 6 tasks')).toBeInTheDocument();
  });

  it('renders a canvas element', async () => {
    const { fixture } = await render(StatusChart, {
      inputs: { data: { todo: 0, in_progress: 0, done: 0 } },
    });
    expect((fixture.nativeElement as HTMLElement).querySelector('canvas')).not.toBeNull();
  });
});
