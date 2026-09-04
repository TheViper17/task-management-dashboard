export interface NavItem {
  readonly label: string;
  readonly path: string;
  readonly icon: string;
}

/** Main navigation, in the order shown in the Figma sidebar. */
export const NAV_ITEMS: readonly NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
  { label: 'Tasks', path: '/tasks', icon: 'task_alt' },
  { label: 'Calendar', path: '/calendar', icon: 'calendar_today' },
  { label: 'Analytics', path: '/analytics', icon: 'bar_chart' },
  { label: 'Team', path: '/team', icon: 'group' },
  { label: 'Settings', path: '/settings', icon: 'settings' },
];
