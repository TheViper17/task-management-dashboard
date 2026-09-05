/**
 * i18n domain types.
 *
 * This is a small custom signal-based translation system, not
 * @angular/localize. @angular/localize compiles a separate bundle per
 * locale, which rules out an instant in-page toggle without navigating to
 * a different build — this app ships one build and switches at runtime
 * instead, the same call as signals over NgRx and a small
 * NotificationService over a toast library.
 */

export type Locale = 'en' | 'ar';

/**
 * CLDR plural categories — English only ever resolves to 'one'/'other',
 * Arabic can land on any of the six. Picked via Intl.PluralRules, not a
 * hand-rolled count === 1 check, which is what actually makes Arabic's
 * dual/few/many forms possible.
 */
export type PluralCategory = 'zero' | 'one' | 'two' | 'few' | 'many' | 'other';

/**
 * A translation entry is either a plain string, or, for something whose
 * wording depends on a count, a map of plural category to wording. Every
 * plural entry needs an 'other' — the fallback for any category a
 * language doesn't otherwise distinguish.
 */
export type TranslationValue =
  string | ({ other: string } & Partial<Record<PluralCategory, string>>);

export type TranslationDictionary = Record<string, TranslationValue>;

export type TranslateParams = Record<string, string | number>;
