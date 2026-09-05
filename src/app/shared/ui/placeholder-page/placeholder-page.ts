import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import type { TranslationKey } from '../../../core/i18n/translations/en';

/**
 * Stand-in for a route that isn't built yet. Bound entirely via route
 * data + withComponentInputBinding() in app.routes.ts — no wrapper
 * component needed per route for titleKey/subtitleKey/icon. These are
 * translation keys, not display text — route data can't call
 * TranslationService itself, so the key gets resolved here instead.
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
