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
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/pages/dashboard-page/dashboard-page').then(
            (m) => m.DashboardPage,
          ),
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
        path: 'analytics',
        loadComponent: () =>
          import('./features/analytics/pages/analytics-page/analytics-page').then(
            (m) => m.AnalyticsPage,
          ),
      },
      {
        path: 'team',
        loadComponent: () =>
          import('./features/team/pages/team-page/team-page').then((m) => m.TeamPage),
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
