import { Pipe, inject } from '@angular/core';
import type { PipeTransform } from '@angular/core';
import type { TranslateParams } from './translation.model';
import { TranslationService } from './translation.service';
import type { TranslationKey } from './translations/en';

/**
 * `{{ 'some.key' | translate }}` / `{{ 'some.key' | translate: { count } }}`.
 *
 * Deliberately impure: a *pure* pipe only re-runs when its own arguments
 * change by reference, so it would never notice `TranslationService`'s
 * locale signal changing internally. An impure pipe re-runs on every
 * change-detection pass instead — and in this zoneless app, writing to a
 * signal (like the locale) is exactly what schedules the next pass, so the
 * two are a matched pair, not a workaround.
 */
@Pipe({ name: 'translate', pure: false })
export class TranslatePipe implements PipeTransform {
  private readonly i18n = inject(TranslationService);

  transform(key: TranslationKey, params?: TranslateParams): string {
    return this.i18n.translate(key, params);
  }
}
