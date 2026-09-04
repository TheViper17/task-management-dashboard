import { render, screen } from '@testing-library/angular';
import { Avatar } from './avatar';

describe('Avatar', () => {
  it('renders the given initials as text', async () => {
    await render(Avatar, { inputs: { initials: 'JD' } });
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('defaults to a 36px circle', async () => {
    const { fixture } = await render(Avatar, { inputs: { initials: 'JD' } });
    const host = fixture.nativeElement as HTMLElement;
    const el = host.querySelector<HTMLElement>('.avatar')!;
    expect(el.style.width).toBe('36px');
    expect(el.style.height).toBe('36px');
  });

  it('resizes from the size input', async () => {
    const { fixture } = await render(Avatar, { inputs: { initials: 'SS', size: 48 } });
    const host = fixture.nativeElement as HTMLElement;
    const el = host.querySelector<HTMLElement>('.avatar')!;
    expect(el.style.width).toBe('48px');
    expect(el.style.height).toBe('48px');
  });
});
