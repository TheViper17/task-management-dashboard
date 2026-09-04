import type { Routes } from '@angular/router';

/**
 * `withComponentInputBinding()` (enabled in app.config.ts) maps a route's
 * `data` object directly onto matching component `input()`s — that's how
 * `PlaceholderPage`'s `title`/`subtitle` are set below with no wrapper
 * component per route.
 */
export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/shell/shell').then((m) => m.Shell),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        // TODO(phase 4.5): replace with the lazy-loaded dashboard feature.
        path: 'dashboard',
        loadComponent: () =>
          import('./shared/ui/placeholder-page/placeholder-page').then((m) => m.PlaceholderPage),
        data: { title: 'Dashboard', subtitle: 'The board is landing in the next phase.' },
      },
      {
        // TODO(later phase): task list / create-edit form host.
        path: 'tasks',
        loadComponent: () =>
          import('./shared/ui/placeholder-page/placeholder-page').then((m) => m.PlaceholderPage),
        data: { title: 'Tasks', icon: 'task_alt' },
      },
      {
        // Out of scope per the brief — kept so the sidebar link doesn't 404.
        path: 'calendar',
        loadComponent: () =>
          import('./shared/ui/placeholder-page/placeholder-page').then((m) => m.PlaceholderPage),
        data: { title: 'Calendar', icon: 'calendar_today' },
      },
      {
        // TODO(later phase): charts + activity feed.
        path: 'analytics',
        loadComponent: () =>
          import('./shared/ui/placeholder-page/placeholder-page').then((m) => m.PlaceholderPage),
        data: { title: 'Analytics', icon: 'bar_chart' },
      },
      {
        // TODO(later phase): user directory.
        path: 'team',
        loadComponent: () =>
          import('./shared/ui/placeholder-page/placeholder-page').then((m) => m.PlaceholderPage),
        data: { title: 'Team', icon: 'group' },
      },
      {
        // Out of scope per the brief — kept so the sidebar link doesn't 404.
        path: 'settings',
        loadComponent: () =>
          import('./shared/ui/placeholder-page/placeholder-page').then((m) => m.PlaceholderPage),
        data: { title: 'Settings', icon: 'settings' },
      },
    ],
  },
  {
    path: '**',
    loadComponent: () =>
      import('./shared/ui/placeholder-page/placeholder-page').then((m) => m.PlaceholderPage),
    data: { title: 'Page not found', icon: 'error_outline', subtitle: '' },
  },
];
