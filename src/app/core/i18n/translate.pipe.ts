import { Pipe, inject } from '@angular/core';
import type { PipeTransform } from '@angular/core';
import type { TranslateParams } from './translation.model';
import { TranslationService } from './translation.service';
import type { TranslationKey } from './translations/en';

/**
 * `{{ 'some.key' | translate }}` or `{{ 'some.key' | translate: { count } }}`.
 *
 * Impure on purpose — a pure pipe only re-runs when its own arguments
 * change, so it'd never notice the locale signal changing inside
 * TranslationService. An impure pipe re-runs on every change-detection
 * pass instead, and in this zoneless app, writing to a signal is exactly
 * what schedules that pass anyway.
 */
@Pipe({ name: 'translate', pure: false })
export class TranslatePipe implements PipeTransform {
  private readonly i18n = inject(TranslationService);

  transform(key: TranslationKey, params?: TranslateParams): string {
    return this.i18n.translate(key, params);
  }
}
