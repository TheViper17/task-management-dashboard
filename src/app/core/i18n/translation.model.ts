/**
 * i18n domain types.
 *
 * A lightweight, custom, signal-based translation system — not
 * `@angular/localize` — deliberately: `@angular/localize` compiles one
 * separate app bundle per locale (locale-prefixed output folders, a
 * redirect/routing setup to pick one), which rules out an instant in-page
 * language toggle without a full navigation to a different build. This app
 * ships a single build and switches language at runtime, the same
 * "lightweight over heavy, matches the actual requirement" call already made
 * for state management (signals over NgRx) and toasts (a small
 * `NotificationService` over a toast library).
 */

export type Locale = 'en' | 'ar';

/**
 * CLDR plural categories (a subset applies per language — English only ever
 * resolves to 'one'/'other'; Arabic can resolve to any of the six). Selected
 * via `Intl.PluralRules`, never guessed at by hand-rolled `count === 1`
 * checks, which is what makes Arabic's dual/few/many forms possible at all.
 */
export type PluralCategory = 'zero' | 'one' | 'two' | 'few' | 'many' | 'other';

/**
 * A translation entry is either a plain string, or — for a message whose
 * wording depends on a `count` param — a map of plural category to wording.
 * Every plural entry must supply 'other'; it's the guaranteed fallback for
 * any category a given language doesn't otherwise distinguish.
 */
export type TranslationValue =
  string | ({ other: string } & Partial<Record<PluralCategory, string>>);

export type TranslationDictionary = Record<string, TranslationValue>;

export type TranslateParams = Record<string, string | number>;
