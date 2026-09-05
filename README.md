# Task Management Dashboard

A task management dashboard built for a senior Angular developer take-home
assignment. Angular 22, zoneless, standalone components, Signals, Angular
Material, `httpResource`, Reactive Forms, Chart.js, and a json-server mock
backend, matching the Figma design that came with the brief.

**Live repo:** https://github.com/TheViper17/task-management-dashboard

> The brief asked for Angular 20/21.next. Running `@angular/cli@latest` gave
> me Angular 22.1.5, the current stable release, and I kept it — it's a
> superset of what was asked, and `httpResource` ships stable there instead
> of as developer preview. Other non-obvious choices are explained in
> [Architecture decisions](#architecture-decisions).

---

## Table of contents

- [Screenshots](#screenshots)
- [Features](#features)
- [Getting started](#getting-started)
- [Available scripts](#available-scripts)
- [Environment configuration](#environment-configuration)
- [Architecture decisions](#architecture-decisions)
- [State management](#state-management)
- [Forms](#forms)
- [Testing strategy](#testing-strategy)
- [Performance optimizations](#performance-optimizations)
- [Accessibility](#accessibility)
- [Internationalization](#internationalization)
- [CI](#ci)
- [Known limitations & future improvements](#known-limitations--future-improvements)

---

## Screenshots

| Dashboard                                    | Analytics                                    |
| -------------------------------------------- | -------------------------------------------- |
| ![Dashboard](docs/screenshots/dashboard.png) | ![Analytics](docs/screenshots/analytics.png) |

| Mobile (390px)                         | Create task, validation errors                            |
| -------------------------------------- | --------------------------------------------------------- |
| ![Mobile](docs/screenshots/mobile.png) | ![Task form validation](docs/screenshots/form-errors.png) |

---

## Features

**Task management** — create, edit, and delete tasks (with a confirmation
step), filter by status, priority, or assignee, search in real time, and
drag and drop between and within columns.

**Dashboard** — 4 live stat cards, priority/status charts (Chart.js), a
recent-activity feed, and a team directory showing live per-user task
counts.

**Internationalization** (bonus item) — English and Arabic, switched from
the header, with real RTL layout mirroring and proper grammatical plurals.
See [Internationalization](#internationalization).

**Everything on the brief's "Must Do" list**: standalone components,
Signals for state, a smart/presentational split, `httpResource` for reads,
interceptor-based response caching, OnPush everywhere, lazy loading per
feature, Reactive Forms with custom validators and a dynamic `FormArray`,
Angular Material, a responsive layout, skeleton/error states, 80%+
enforced test coverage, ESLint + Prettier + Husky, and conventional
commits.

---

## Getting started

### Prerequisites

- Node.js **24.x** — what this was built and CI-tested against. Angular
  22 supports `^20.19 || ^22.12 || ^24`, so anything 22.12+ works too.
- npm 11.x (ships with Node 24)

### Installation

```bash
git clone https://github.com/TheViper17/task-management-dashboard.git
cd task-management-dashboard
npm install
```

`npm install` also runs Husky's `prepare` step, so the pre-commit /
commit-msg / pre-push git hooks are wired up automatically — nothing extra
to set up.

### Running it

```bash
npm run dev
```

This starts the Angular dev server (`:4200`) and the json-server mock API
(`:3000`) together, via `concurrently`. The dev-server proxy
(`proxy.conf.json`) forwards `/api/*` to `:3000`, so the app always talks
to a same-origin `/api/...` path no matter what's actually serving it.

Open **http://localhost:4200**.

To run just one piece: `npm start` for Angular alone, or `npm run api` for
just json-server (useful if you're pointing the frontend at it from
somewhere else).

---

## Available scripts

| Script                  | What it does                                                                  |
| ----------------------- | ----------------------------------------------------------------------------- |
| `npm run dev`           | Angular dev server + json-server together                                     |
| `npm start`             | Angular dev server only (`:4200`)                                             |
| `npm run api`           | json-server only (`:3000`)                                                    |
| `npm run db:reset`      | Regenerates `mock-api/db.json` with dates relative to _today_                 |
| `npm run build`         | Production build (`dist/task-management-dashboard/browser`)                   |
| `npm run watch`         | Development-mode build, rebuilds on change                                    |
| `npm test`              | Runs the unit test suite once (Vitest); **fails if coverage drops below 80%** |
| `npm run test:watch`    | Unit tests in watch mode                                                      |
| `npm run test:coverage` | Explicit coverage run (equivalent to `npm test` — coverage is always on)      |
| `npm run lint`          | ESLint, zero warnings tolerated                                               |
| `npm run lint:fix`      | ESLint with autofix                                                           |
| `npm run format`        | Prettier, writes                                                              |
| `npm run format:check`  | Prettier, checks only (what CI runs)                                          |

---

## Environment configuration

There's no `environment.ts`/`environment.prod.ts` split. The only value
that actually changes between environments is the API base URL, and it's
handled the same way everywhere: the app always calls the relative path
`/api/...` (see the `API_BASE_URL` token in `app.config.ts`), and
whatever's in front of it decides where that actually goes:

| Context               | `/api` is handled by                                                  |
| --------------------- | --------------------------------------------------------------------- |
| `npm run dev`         | Angular CLI dev-server proxy (`proxy.conf.json`) → `localhost:3000`   |
| Any other static host | Reverse-proxy `/api` to wherever json-server (or a real backend) runs |

The response-cache TTL (`CACHE_TTL_MS`, 30s) is the same kind of plain
provider value in `app.config.ts` rather than an environment file — it
never needed to differ between dev and prod here.

---

## Architecture decisions

### Folder structure

```
src/app/
├── core/            # singletons, no UI — models, api, interceptors, stores, tokens
├── shared/           # generic, reusable, presentational — atoms + a placeholder-page
├── layout/           # the persistent shell: Header, Sidebar, Shell (smart)
└── features/
    ├── dashboard/    # stat cards, toolbar, board — the main screen
    ├── tasks/        # the create/edit form + dialog service
    ├── analytics/    # charts + activity feed
    └── team/         # user directory
```

The rule: `features` can depend on `core` and `shared`, never the other
way, and features don't import each other. One exception — both
`DashboardPage` and `Shell` import `features/tasks/task-dialog.service` to
open the create/edit dialog. Duplicating that logic in two places, or
inventing a whole new layer just to hold one shared service, seemed worse
than just breaking the rule here.

### Smart / presentational split

The only components that `inject()` a store or open a dialog are the
pages (`DashboardPage`, `AnalyticsPage`, `TeamPage`) and the layout shell
(`Shell`) — everything else just reacts to its own `input()`s and emits
`output()`s, with `OnPush` and no injected state. About 30 of this
project's ~38 components fall into that second group, which is most of
why hitting 80% coverage didn't need much `TestBed` setup per test — most
components are just render-and-assert.

### Zoneless

Angular 22 goes zoneless by default once `zone.js` isn't a dependency,
which it isn't here — but `provideZonelessChangeDetection()` is still
called explicitly in `app.config.ts`, so the intent is stated rather than
implied by an absence. Combined with Signals and OnPush everywhere, this
cuts out a whole category of "why didn't the view update" debugging, and
the shipped bundle is smaller too.

### `httpResource`, and where it stops

`httpResource` (stable in Angular 22) handles every read — `TaskStore`,
`UserStore`, and `StatisticsStore` all fetch this way. Writes are
different: `create`/`update`/`remove`/`move` go through the plain
`TaskApiService` (`HttpClient`), then patch the resource's own signal
directly rather than going through its async loader. `httpResource` is
built for reactive re-fetching, and a task board doing optimistic updates
with rollback needs something that can mutate synchronously the moment a
user acts, then reconcile with the server afterward. Two different jobs,
two different tools.

### Interceptor order (a mistake I caught while building it)

`provideHttpClient(withInterceptors([cacheInterceptor, errorInterceptor, retryInterceptor]))`
— cache outermost, retry innermost. I originally had retry and error the
other way round. While building it, it became clear that was wrong: if
retry sits outside error, it only ever sees already-mapped `AppError`
objects, and can't tell a retryable 503 from a non-retryable 404. Retry
needs to be closest to the backend, seeing the raw `HttpErrorResponse` —
only once it's exhausted its attempts (or skipped a 4xx) should the error
reach the mapping/notification layer. Each interceptor's own comment
explains this too, not just this section.

### Caching

`cacheInterceptor` caches GET responses in `HttpCacheStore`, an injectable
wrapper around a plain TTL-based `Map`. Any non-GET request invalidates
everything under that resource's root, so a create/update/delete never
gets left looking stale by an old cache hit.

---

## State management

Signals plus a per-domain store service — `TaskStore`, `UserStore`,
`StatisticsStore`, `ActivityStore` — no NgRx. The brief already leans this
way ("Signals for reactive state management where appropriate"), and an
app with this few entity types doesn't really need NgRx's
action/reducer/effect machinery.

Every store follows the same rule: one array of real state, everything
else derived from it. `TaskStore.tasks` is the only thing actually
stored — `filteredTasks`, `columns`, `counts`, `priorityMix`, and
`statusMix` are all `computed()` from it. Nothing can drift out of sync,
because there's nothing to forget to keep in sync in the first place.

**Optimistic updates everywhere.** Every mutation — `create`, `update`,
`remove`, `move` — patches the signal right away, calls the API, then
either reconciles with the real response or rolls back to the previous
snapshot if it fails. Drag-and-drop reordering (`computeTaskOrderPatches`)
boils down to the same idea: recompute a column's final order and only
patch what actually changed.

**The stat cards' headline numbers never come from the mock API's static
seed data.** `mergeLiveStatistics` swaps in the real count from
`TaskStore`, keeping only the seed's `change`/`changeLabel` text (which
there's no way to derive live). The seed data claims "156 total tasks";
this repo's actual dataset has 17. The card says 17.

---

## Forms

`TaskForm` (create/edit) demonstrates every item the brief lists under
"Forms":

- **Custom validators** (`features/tasks/validators/task.validators.ts`,
  tested independently of any component): `notInPastValidator`,
  `assigneeExistsValidator` (checks the live assignee list via a getter,
  not a snapshot), `maxTagsValidator`, `nonBlankValidator`.
- **Dynamic form controls**: `tags` is a `FormArray` the user grows and
  shrinks, capped at 5.
- **Form state management**: the due-date validator changes depending on
  create vs. edit mode — you can't create a task that's already overdue,
  but editing one that's already overdue shouldn't force the date forward
  just to satisfy that same rule.
- **Error handling and display**: touched-gated `mat-error` per field.
  The submit button is never disabled on purpose — clicking it while
  invalid calls `markAllAsTouched()` and reveals every error at once,
  which is more helpful than a button that just silently refuses to do
  anything.

---

## Testing strategy

**Vitest** (Angular 22's own default `ng test` runner — not swapped in
from Jest) plus **Angular Testing Library**, favoring accessible,
behavior-focused queries (`getByRole`, `getByLabelText`) over
implementation details.

- **Pure functions** (`task.utils`, `date.utils`, `statistic.utils`,
  `board-drag-drop.utils`, the form validators) get tested directly, no
  Angular test machinery involved. This is where the reorder math,
  overdue logic, and relative-time formatting actually live, and where
  most of the edge cases get proven.
- **Presentational components** render with inputs, then assert on the
  DOM and emitted outputs — no injected providers needed for about 30 of
  this app's 38 components.
- **Stores** are tested with the relevant `*ApiService` mocked, asserting
  signal state after each command, including the optimistic-update and
  rollback-on-failure paths.
- **Interceptors** use `provideHttpClientTesting`: cache-hit-skips-network,
  retry timing (via `vi.useFakeTimers`), and error mapping are all
  asserted against a real `HttpClient` pipeline, not reimplemented.
- **Smart pages** get one broader test each, mocking their stores and
  services, driving the actual user flow (open a menu, click Delete,
  confirm, assert the store call).

**Coverage gate**: `angular.json`'s `test` target sets
`coverageThresholds` to 80% across statements, branches, functions, and
lines. `ng test` (what CI runs) actually fails the build if any of them
drop below that — it doesn't just print a number and move on. Currently
sitting at 99%+ on all four; run `npm test` to see the summary.

**One gotcha worth knowing about**: `mat-menu` (the card "more actions"
menu, the priority filter) relies on CDK Overlay, which needs real timers
to actually open. If a spec file also fakes `Date` for a deterministic
"today," use `vi.useFakeTimers({ toFake: ['Date'] })` rather than a bare
`vi.useFakeTimers()` — otherwise the menu interaction just hangs until
the test times out. `task-card.spec.ts` has the fix in context.

---

## Performance optimizations

- **`OnPush`** on every component, enforced by an ESLint rule
  (`@angular-eslint/prefer-on-push-component-change-detection`) rather
  than just habit.
- **Zoneless** change detection (see [above](#zoneless)).
- **Lazy loading per feature**: every route (`dashboard`, the `tasks`
  dialog, `analytics`, `team`) is its own `loadComponent` chunk. I
  checked this against the real build output rather than assuming it
  worked:
  - Registering Chart.js's `provideCharts(withDefaultRegisterables())`
    at the app root pulled all of Chart.js into the eager bundle, even
    though `AnalyticsPage` itself is lazy — the initial bundle blew past
    the 500kB budget by 182kB, for a chart someone might never open.
    Moving that provider onto `AnalyticsPage`'s own `providers` array
    brought the initial bundle down from 682kB to 471kB.
- **HTTP response caching** via `cacheInterceptor` (see above), so
  navigating back to an already-fetched view doesn't always re-hit the
  network within the TTL window.
- **Retry with exponential backoff** on transient GET failures only
  (network errors, 5xx) — a 4xx or any non-GET is never retried, since
  retrying a non-idempotent request risks double-submitting it.
- **`@for` with `track`** everywhere a list renders (never index-based),
  so Angular can diff and reuse DOM nodes instead of tearing lists down
  and rebuilding them on every change.
- **Didn't need `@defer`**: the heavy, rarely-visited stuff
  (Analytics/Chart.js, the Tasks dialog) is already lazy at the route
  boundary, which is a coarser but simpler way to solve the same problem.

---

## Accessibility

- **Contrast was actually measured, not eyeballed**: every colour pair in
  use got checked against WCAG 2.1 AA (4.5:1 for text) with a small
  script, instead of trusting that it "looked fine." Two pairs genuinely
  failed — medium-priority badge text was 2.86:1, high-priority/overdue
  text was 4.35:1 — and both got the minimum darkening needed to clear
  4.5:1.
- **Skip-to-content link**, visible on keyboard focus.
- **`:focus-visible`** styled globally, not suppressed.
- **`prefers-reduced-motion`** collapses every animation — including the
  loading-skeleton pulse — to near-instant, globally, in one place rather
  than per component.
- Chart.js draws to a `<canvas>`, which is invisible to screen readers
  and can't read CSS custom properties. Every chart also renders a hidden
  `.sr-only` list with the same numbers as real text, and its colours are
  the same palette duplicated as literal hex (with a comment explaining
  why, right where it's duplicated).
- Every icon-only button has an `aria-label`; every decorative icon is
  `aria-hidden`; `routerLinkActive` drives `aria-current="page"`.
- The responsive sidebar drawer is Angular Material's `MatSidenav`, which
  comes with backdrop, focus-trapping in `'over'` mode, and
  keyboard/Escape handling built in — none of that had to be
  reimplemented.

Full WCAG 2.1 AA compliance (the brief's bonus item) hasn't been audited
with a tool like axe or Lighthouse — see
[Known limitations](#known-limitations--future-improvements).

---

## Internationalization

English (primary) and Arabic (secondary, full RTL), switched from the
globe icon in the header. The choice is saved to `localStorage`, and
falls back to detecting the browser's language on first visit. Switching
language does trigger a page reload — deliberately, explained below.

**Why a small custom service instead of `@angular/localize`**: Angular's
official i18n pipeline compiles a separate app bundle per locale, which
is great for a multi-region deployment behind locale-prefixed URLs, but
rules out an in-page toggle without navigating to a different build. This
app switches language at runtime instead, in one build — the same call
already made for state (signals over NgRx) and toasts (a small
`NotificationService` over a toast library).

It all lives in `core/i18n/`: a `TranslationService` holding the current
locale as a signal with a `translate(key, params)` method, an impure
`TranslatePipe` for templates, and two typed dictionaries
(`translations/en.ts`, `translations/ar.ts`). The pipe is impure on
purpose — a pure pipe only re-runs when its own arguments change, so it'd
never notice the locale signal changing internally. Arabic is typed
against English's exact key set, so adding a string to one file without
the other is a compile error, not a translation that's silently missing
at runtime.

**Plurals use `Intl.PluralRules`, not `count === 1`.** Arabic has six
grammatical plural categories — zero/one/two/few/many/other — against
English's two. A `count` param resolves through `Intl.PluralRules` to
pick the right one, so it's "يستحق خلال 6 أيام" (the correct _few_ form
for 3–10), never a literal "6 يوم" bolted on the wrong way.

**The layout actually mirrors — it's not just translated text sitting in
an LTR layout.** Switching to Arabic sets `dir="rtl"`, and the app's own
CSS uses logical properties (`border-inline-start`, `inset-inline-start`)
instead of physical ones (`border-left`, `left`), so it mirrors
automatically with no Arabic-specific overrides needed. Flexbox and Grid
row layouts — the board's three columns, the header's action row —
mirror on their own too, since that's just how the inline axis works
once `dir` is set.

**Why switching language reloads the page.** Angular CDK's
`Directionality` — what `mat-menu`, `mat-select`, `mat-datepicker`, and
`mat-sidenav` all read to decide which side to open or anchor from —
resolves `document.dir` once, at construction, with no way to re-mirror
components that already exist. Just mutating `document.dir` after the
app's booted would flip this app's own CSS (which reads it live) but
leave every Material overlay pointing the wrong way. A reload is the
standard fix for this. It's cheap here too: `TranslationService` sets
`lang`/`dir`/the document title before the root component — and so
before `Directionality` — is ever constructed, via a
`provideAppInitializer` in `app.config.ts`.

**Server text gets matched by id, not translated as free text.** The
dashboard stat cards' `title`/`changeLabel` come from the (mock)
statistics API — a real backend's own copy, not this app's. Rather than
trying to translate arbitrary server strings, each known stat id maps to
a translation key; anything outside that known set just falls back to
whatever the server sent, same as it would have to with a real backend.

---

## CI

`.github/workflows/ci.yml` runs on every push and PR to `main`: lint plus
format check, the full test suite (which enforces the 80% coverage gate —
a drop fails the run, it's not just reported), and a production build
(which catches AOT/type errors dev mode can miss and enforces the bundle
budget). Three separate jobs, so a lint failure doesn't hide whether the
tests also failed.

---

## Known limitations & future improvements

- **No authentication.** Out of scope per the brief — the header's
  current-user avatar is just the first entry in the mocked user list,
  noted inline in `Shell` where that shortcut is taken.
- **Activity feed is synthesized, not real.** The mock API has no
  activity collection, so `ActivityStore` seeds itself from the most
  recently updated tasks on first load, then appends an entry per
  `TaskStore` command for the rest of the session, persisted to
  `localStorage`. It's a reasonable stand-in, not a real audit log.
- **`mock-api/db.json` drifts locally as you use the app** (json-server
  writes through). `npm run db:reset` regenerates it from the assignment's
  original generator with dates relative to _today_ — run it before a
  demo if the data's gotten stale or messy.
- **Lighthouse / a formal WCAG audit**: not run (both bonus items). The
  a11y work here — measured contrast, skip link, focus management,
  sr-only chart summaries — was done to actually hold up under an audit,
  I just haven't run one.
- **Calendar / Settings** are intentionally unbuilt placeholder routes —
  present in the Figma sidebar, not in the brief's functional
  requirements.
- **Drag-and-drop keyboard accessibility**: Angular CDK's drag-drop
  doesn't ship full keyboard-driven reordering out of the box. The
  mitigation already in place: every status change reachable by drag is
  _also_ reachable through the fully keyboard-accessible Edit form (a
  `mat-select`), so no functionality is drag-only.
- **If this grew past a handful of users**: `TeamPage`'s per-user task
  count does an O(tasks) scan on every render via `computed()` — fine at
  this scale, but I'd want a `Map` built once per `tasks()` change at
  real scale. Didn't bother pre-emptively; that would've just been
  premature optimization.
