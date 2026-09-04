import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import type { TranslationKey } from '../../../core/i18n/translations/en';

/**
 * Stand-in for a route that isn't built yet. Bound entirely via route
 * `data` + `withComponentInputBinding()` in `app.routes.ts` — no per-route
 * wrapper component needed for `titleKey`/`subtitleKey`/`icon`.
 * `title`/`subtitle` are translation *keys*, not display text — route
 * `data` can't itself call `TranslationService`, so the key is resolved
 * here, in the one place that can.
 */
@Component({
  selector: 'app-placeholder-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule, TranslatePipe],
  templateUrl: './placeholder-page.html',
  styleUrl: './placeholder-page.scss',
})
export class PlaceholderPage {
  readonly titleKey = input.required<TranslationKey>();
  /** `null` renders no subtitle at all — used by the "page not found" route. */
  readonly subtitleKey = input<TranslationKey | null>('placeholder.comingSoon');
  readonly icon = input('construction');
}
