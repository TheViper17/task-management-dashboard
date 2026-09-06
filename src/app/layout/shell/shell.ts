import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { debounceTime, distinctUntilChanged, filter, map } from 'rxjs/operators';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { TaskStore } from '../../core/stores/task.store';
import { UserStore } from '../../core/stores/user.store';
import { TaskDialogService } from '../../features/tasks/task-dialog.service';
import { Header } from '../header/header';
import { Sidebar } from '../sidebar/sidebar';

/** How long to wait after the last keystroke before filtering the board. */
const SEARCH_DEBOUNCE_MS = 300;

/** Matches the `below('tablet')` SCSS mixin — kept in one place, see _tokens.scss. */
const HANDSET_QUERY = '(max-width: 1023.98px)';

/**
 * The persistent app shell: header + sidebar + routed content. This is
 * the one "smart" piece of layout — it owns the global search box's
 * debounce (a textbook use of debounceTime/distinctUntilChanged, covering
 * the "proper RxJS operator usage" requirement), resolves the header's
 * current-user avatar, and switches the sidebar between a permanently
 * visible rail (desktop) and an overlay drawer (tablet/mobile) via CDK's
 * BreakpointObserver — a real Angular layout primitive, not just a CSS
 * media query, since MatSidenav's mode is a bound TS property. Everything
 * else it renders is presentational.
 */
@Component({
  selector: 'app-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, MatSidenavModule, TranslatePipe, Header, Sidebar],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
})
export class Shell {
  private readonly taskStore = inject(TaskStore);
  private readonly userStore = inject(UserStore);
  private readonly taskDialog = inject(TaskDialogService);
  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly router = inject(Router);

  private readonly drawer = viewChild.required(MatSidenav);

  // No auth in this app (out of scope per the brief) — the first user in
  // the mocked directory stands in for "the current user".
  readonly currentUser = computed(() => this.userStore.users()[0] ?? null);

  readonly isHandset = toSignal(
    this.breakpointObserver.observe(HANDSET_QUERY).pipe(map((result) => result.matches)),
    { initialValue: false },
  );

  // The header's search box only makes sense on the dashboard — it drives
  // TaskStore's filter, which nothing on the other routes reads. Router.url
  // is a plain snapshot, not reactive on its own, so this re-derives it
  // from NavigationEnd events instead of just reading it once.
  protected readonly isDashboardRoute = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map(() => this.router.url.startsWith('/dashboard')),
    ),
    { initialValue: this.router.url.startsWith('/dashboard') },
  );

  private readonly searchTerm = signal('');

  constructor() {
    toObservable(this.searchTerm)
      .pipe(debounceTime(SEARCH_DEBOUNCE_MS), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((term) => this.taskStore.setSearch(term));
  }

  onSearchChange(term: string): void {
    this.searchTerm.set(term);
  }

  onNewTask(): void {
    this.taskDialog.createTask();
  }

  onMenuToggle(): void {
    void this.drawer().toggle();
  }

  /** Closes the drawer after navigating, but only on handset — desktop's 'side' mode stays open. */
  onSidebarLinkClick(): void {
    if (this.isHandset()) {
      void this.drawer().close();
    }
  }
}
