import { Injectable, computed, signal } from '@angular/core';
import type { Locale, TranslateParams, TranslationValue } from './translation.model';
import { en } from './translations/en';
import type { TranslationKey } from './translations/en';
import { ar } from './translations/ar';

const STORAGE_KEY = 'task-dashboard:locale';
const RTL_LOCALES: ReadonlySet<Locale> = new Set(['ar']);

/**
 * Runtime translation + locale service. See translation.model.ts for why
 * this is a small custom service instead of @angular/localize.
 *
 * setLocale() reloads the page, and that's deliberate. Angular CDK's
 * Directionality — what mat-menu, mat-select, mat-datepicker, and
 * mat-sidenav all read to decide which side to open or anchor from —
 * resolves document.dir once, at construction, with no way to re-mirror
 * components that already exist. Mutating document.dir after boot would
 * flip this app's own layout (which reads dir live) but leave every
 * Material overlay pointing the wrong way. A reload is the standard fix
 * for that, and it also means Directionality and the datepicker's locale
 * (see TaskForm) are correct from the first paint instead of patched up
 * after.
 */
@Injectable({ providedIn: 'root' })
export class TranslationService {
  private readonly dictionaries = { en, ar };

  private readonly _locale = signal<Locale>(readInitialLocale());
  readonly locale = this._locale.asReadonly();
  readonly dir = computed(() => (RTL_LOCALES.has(this._locale()) ? 'rtl' : 'ltr'));

  constructor() {
    // Synchronous, not an effect() — has to run before any component (and
    // especially before CDK builds its Directionality singleton) reads
    // document.documentElement.dir. Forced early via a
    // provideAppInitializer in app.config.ts.
    this.applyToDocument(this._locale());
  }

  setLocale(locale: Locale): void {
    if (locale === this._locale()) return;
    persist(locale);
    this.applyToDocument(locale);
    window.location.reload();
  }

  /**
   * Resolves key in the current locale (falling back to English if it's
   * somehow missing there — shouldn't happen, ar.ts is typed to cover
   * every English key), then fills in any {param} placeholders.
   *
   * key only has to be a real key at compile time — a route's data, or
   * anything else built from a plain string at runtime, can still hand
   * this something unrecognised (a stale route-data field name did
   * exactly that once). If both lookups come up empty, this just returns
   * the key itself — a visible "this string is missing" marker instead of
   * a crash.
   *
   * A count in params picks the right plural form via Intl.PluralRules,
   * for entries that have one.
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
