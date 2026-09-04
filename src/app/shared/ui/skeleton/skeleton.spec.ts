import { render } from '@testing-library/angular';
import { Skeleton } from './skeleton';

describe('Skeleton', () => {
  it('defaults to a full-width 16px bar', async () => {
    const { fixture } = await render(Skeleton);
    const el = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>('.skeleton')!;
    expect(el.style.width).toBe('100%');
    expect(el.style.height).toBe('16px');
  });

  it('applies custom width/height/radius', async () => {
    const { fixture } = await render(Skeleton, {
      inputs: { width: '40%', height: '32px', radius: '50%' },
    });
    const el = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>('.skeleton')!;
    expect(el.style.width).toBe('40%');
    expect(el.style.height).toBe('32px');
    expect(el.style.borderRadius).toBe('50%');
  });

  it('is hidden from assistive tech (the loading container announces the state once)', async () => {
    const { fixture } = await render(Skeleton);
    const el = (fixture.nativeElement as HTMLElement).querySelector('.skeleton')!;
    expect(el).toHaveAttribute('aria-hidden', 'true');
  });
});
