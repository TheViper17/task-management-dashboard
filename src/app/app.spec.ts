import { provideRouter, withComponentInputBinding } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import { App } from './app';

describe('App', () => {
  it('renders the routed page at the root path', async () => {
    await render(App, {
      providers: [
        provideRouter(
          [
            {
              path: '',
              pathMatch: 'full',
              loadComponent: () =>
                import('./shared/ui/placeholder-page/placeholder-page').then(
                  (m) => m.PlaceholderPage,
                ),
              data: { titleKey: 'nav.dashboard' },
            },
          ],
          withComponentInputBinding(),
        ),
      ],
    });

    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
  });
});
