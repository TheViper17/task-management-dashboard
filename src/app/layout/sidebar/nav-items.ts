import type { TranslationKey } from '../../core/i18n/translations/en';

export interface NavItem {
  readonly labelKey: TranslationKey;
  readonly path: string;
  readonly icon: string;
}

/** Main navigation, in the order shown in the Figma sidebar. */
export const NAV_ITEMS: readonly NavItem[] = [
  { labelKey: 'nav.dashboard', path: '/dashboard', icon: 'dashboard' },
  { labelKey: 'nav.tasks', path: '/tasks', icon: 'task_alt' },
  { labelKey: 'nav.calendar', path: '/calendar', icon: 'calendar_today' },
  { labelKey: 'nav.analytics', path: '/analytics', icon: 'bar_chart' },
  { labelKey: 'nav.team', path: '/team', icon: 'group' },
  { labelKey: 'nav.settings', path: '/settings', icon: 'settings' },
];
