import { render, screen } from '@testing-library/angular';
import { PriorityBadge } from './priority-badge';

describe('PriorityBadge', () => {
  it.each([
    ['high', 'HIGH'],
    ['medium', 'MEDIUM'],
    ['low', 'LOW'],
  ] as const)('renders %s priority as "%s"', async (priority, expectedText) => {
    const { fixture } = await render(PriorityBadge, { inputs: { priority } });
    expect(screen.getByText(expectedText)).toBeInTheDocument();
    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector(`.priority-badge--${priority}`)).not.toBeNull();
  });
});
