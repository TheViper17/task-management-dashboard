import { TranslationService } from './translation.service';

const STORAGE_KEY = 'task-dashboard:locale';

describe('TranslationService', () => {
  const originalLanguage = Object.getOwnPropertyDescriptor(window.navigator, 'language');

  function setNavigatorLanguage(language: string): void {
    Object.defineProperty(window.navigator, 'language', { value: language, configurable: true });
  }

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('dir');
    document.documentElement.lang = '';
    setNavigatorLanguage('en-US');
  });

  afterEach(() => {
    if (originalLanguage) Object.defineProperty(window.navigator, 'language', originalLanguage);
  });

  describe('initial locale', () => {
    it('defaults to English when nothing is stored and the browser language is not Arabic', () => {
      const service = new TranslationService();
      expect(service.locale()).toBe('en');
      expect(document.documentElement.lang).toBe('en');
      expect(document.documentElement.dir).toBe('ltr');
    });

    it('detects Arabic from the browser language when nothing is stored', () => {
      setNavigatorLanguage('ar-EG');
      const service = new TranslationService();
      expect(service.locale()).toBe('ar');
      expect(document.documentElement.dir).toBe('rtl');
    });

    it('prefers a previously stored locale over the browser language', () => {
      localStorage.setItem(STORAGE_KEY, 'ar');
      setNavigatorLanguage('en-US');
      const service = new TranslationService();
      expect(service.locale()).toBe('ar');
    });

    it('recovers to English when localStorage holds something unrecognised', () => {
      localStorage.setItem(STORAGE_KEY, 'fr');
      const service = new TranslationService();
      expect(service.locale()).toBe('en');
    });

    it('sets the document title to the translated app title', () => {
      new TranslationService();
      expect(document.title).toBe('Task Manager');
    });
  });

  describe('translate()', () => {
    it('resolves a plain key', () => {
      const service = new TranslationService();
      expect(service.translate('common.cancel')).toBe('Cancel');
    });

    it('interpolates {param} placeholders', () => {
      const service = new TranslationService();
      expect(service.translate('task.moreActions', { title: 'Design homepage' })).toBe(
        'More actions for Design homepage',
      );
    });

    it('leaves an unmatched placeholder untouched rather than dropping it', () => {
      const service = new TranslationService();
      expect(service.translate('board.regionLabel', {})).toBe('{title} column');
    });

    it('selects the English "one" plural form for a count of 1', () => {
      const service = new TranslationService();
      expect(service.translate('dueDate.dueInDays', { count: 1 })).toBe('Due in 1 day');
    });

    it('selects the English "other" plural form for a count other than 1', () => {
      const service = new TranslationService();
      expect(service.translate('dueDate.dueInDays', { count: 5 })).toBe('Due in 5 days');
      expect(service.translate('dueDate.dueInDays', { count: 0 })).toBe('Due in 0 days');
    });

    it('returns the raw key instead of crashing for a key that does not actually exist at runtime', () => {
      // TranslationKey only guarantees a real key at compile time —
      // anything built from a plain string at runtime (route data, a
      // stale field name) can still hand translate() one that's not in
      // either dictionary. This crashed a real render before the guard.
      const service = new TranslationService();
      const bogusKey = 'this.key.does.not.exist' as unknown as Parameters<
        typeof service.translate
      >[0];
      expect(() => service.translate(bogusKey)).not.toThrow();
      expect(service.translate(bogusKey)).toBe('this.key.does.not.exist');
    });

    it('resolves Arabic grammatical plural categories (one/two/few/many/other), not just English-style singular/plural', () => {
      localStorage.setItem(STORAGE_KEY, 'ar');
      const service = new TranslationService();
      expect(service.translate('time.daysAgo', { count: 1 })).toBe('منذ يوم');
      expect(service.translate('time.daysAgo', { count: 2 })).toBe('منذ يومين');
      expect(service.translate('time.daysAgo', { count: 4 })).toBe('منذ 4 أيام'); // few: 3-10
      expect(service.translate('time.daysAgo', { count: 15 })).toBe('منذ 15 يومًا'); // many: 11-99
      expect(service.translate('time.daysAgo', { count: 100 })).toBe('منذ 100 يوم'); // other
    });
  });

  describe('setLocale()', () => {
    let reloadSpy: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      reloadSpy = vi.fn();
      Object.defineProperty(window, 'location', {
        value: { ...window.location, reload: reloadSpy },
        configurable: true,
        writable: true,
      });
    });

    it('persists the new locale, updates the document, and reloads the page', () => {
      const service = new TranslationService();
      service.setLocale('ar');

      expect(localStorage.getItem(STORAGE_KEY)).toBe('ar');
      expect(document.documentElement.lang).toBe('ar');
      expect(document.documentElement.dir).toBe('rtl');
      expect(reloadSpy).toHaveBeenCalledTimes(1);
    });

    it('does nothing — no write, no reload — when set to the already-active locale', () => {
      const service = new TranslationService();
      service.setLocale('en');

      expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
      expect(reloadSpy).not.toHaveBeenCalled();
    });
  });
});
