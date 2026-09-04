import { Injectable, computed, signal } from '@angular/core';
import type { Locale, TranslateParams, TranslationValue } from './translation.model';
import { en } from './translations/en';
import type { TranslationKey } from './translations/en';
import { ar } from './translations/ar';

const STORAGE_KEY = 'task-dashboard:locale';
const RTL_LOCALES: ReadonlySet<Locale> = new Set(['ar']);

/**
 * Runtime translation + locale service. See translation.model.ts's doc
 * comment for why this is a small custom service rather than
 * `@angular/localize`.
 *
 * `setLocale()` reloads the page. That's deliberate, not a shortcut: Angular
 * CDK's `Directionality` (which every overlay-based Material component —
 * `mat-menu`, `mat-select`, `mat-datepicker`, `mat-sidenav` — reads to
 * decide which side it opens/anchors from) resolves `document.dir` exactly
 * once, at its own construction, and has no built-in mechanism to
 * re-mirror components that already exist. Mutating `document.dir` after
 * the app has booted would flip this app's own layout (which reads `dir`
 * live via logical CSS properties) but leave every Material overlay
 * pointing the wrong way. A reload is the standard fix production Angular
 * apps use for exactly this — and it guarantees `Directionality`, along
 * with the datepicker's own locale (see TaskForm), is correct from the
 * very first paint, not patched up after.
 */
@Injectable({ providedIn: 'root' })
export class TranslationService {
  private readonly dictionaries = { en, ar };

  private readonly _locale = signal<Locale>(readInitialLocale());
  readonly locale = this._locale.asReadonly();
  readonly dir = computed(() => (RTL_LOCALES.has(this._locale()) ? 'rtl' : 'ltr'));

  constructor() {
    // Synchronous, not an effect() — must be applied before any component
    // (in particular, before Angular CDK constructs its `Directionality`
    // singleton) reads `document.documentElement.dir`. Forced to run this
    // early via a `provideAppInitializer` in app.config.ts.
    this.applyToDocument(this._locale());
  }

  setLocale(locale: Locale): void {
    if (locale === this._locale()) return;
    persist(locale);
    this.applyToDocument(locale);
    window.location.reload();
  }

  /**
   * Resolves `key` in the current locale (falling back to English if the
   * key is somehow missing there — it never should be, `ar.ts` is typed to
   * cover every English key), then interpolates `{param}` placeholders from
   * `params`.
   *
   * `key`'s type only guarantees a real key at compile time — a route's
   * `data`, or anything else built from a plain string at runtime, can
   * still hand this an unrecognised one (found live: a stale route-data
   * field name did exactly that). `entry` falling through both lookups
   * returns the raw key itself, a visible "this string is missing" marker
   * a developer can spot immediately, rather than a crash mid-render.
   *
   * A `count` in `params` selects the grammatically correct plural form via
   * `Intl.PluralRules` for entries that have one (rather than a hand-rolled
   * `count === 1` check, which can't express Arabic's dual/few/many).
   */
  translate(key: TranslationKey, params?: TranslateParams): string {
    const locale = this._locale();
    const entry = this.dictionaries[locale][key] ?? this.dictionaries.en[key];
    if (entry === undefined) return key;
    const raw = typeof entry === 'string' ? entry : this.resolvePlural(entry, locale, params);
    return interpolate(raw, params);
  }

  private resolvePlural(
    entry: Exclude<TranslationValue, string>,
    locale: Locale,
    params?: TranslateParams,
  ): string {
    const count = params?.['count'];
    const category =
      typeof count === 'number' ? new Intl.PluralRules(locale).select(count) : 'other';
    return entry[category] ?? entry.other;
  }

  private applyToDocument(locale: Locale): void {
    document.documentElement.lang = locale;
    document.documentElement.dir = RTL_LOCALES.has(locale) ? 'rtl' : 'ltr';
    document.title = this.translate('app.title');
  }
}

function readInitialLocale(): Locale {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'en' || stored === 'ar') return stored;
  } catch {
    // localStorage unavailable (private browsing, quota, disabled by
    // policy) — fall through to language detection for this session.
  }
  return navigator.language.toLowerCase().startsWith('ar') ? 'ar' : 'en';
}

function persist(locale: Locale): void {
  try {
    localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    // Non-fatal — the choice just won't survive a refresh this session.
  }
}

function interpolate(text: string, params?: TranslateParams): string {
  if (!params) return text;
  return text.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match,
  );
}
