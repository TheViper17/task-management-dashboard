import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

/**
 * Stand-in for a route that isn't built yet. Bound entirely via route
 * `data` + `withComponentInputBinding()` in `app.routes.ts` — no per-route
 * wrapper component needed for `title`/`subtitle`/`icon`.
 */
@Component({
  selector: 'app-placeholder-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  templateUrl: './placeholder-page.html',
  styleUrl: './placeholder-page.scss',
})
export class PlaceholderPage {
  readonly title = input.required<string>();
  readonly subtitle = input('Coming soon.');
  readonly icon = input('construction');
}
