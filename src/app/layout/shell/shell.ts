import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { TaskStore } from '../../core/stores/task.store';
import { UserStore } from '../../core/stores/user.store';
import { Header } from '../header/header';
import { Sidebar } from '../sidebar/sidebar';

/** How long to wait after the last keystroke before filtering the board. */
const SEARCH_DEBOUNCE_MS = 300;

/**
 * The persistent app shell: header + sidebar + routed content. This is the
 * one "smart" piece of layout — it owns the global search box's debounce
 * (a textbook use of `debounceTime`/`distinctUntilChanged`, satisfying the
 * "proper RxJS operator usage" requirement) and resolves the header's
 * current-user avatar. Everything else it renders is presentational.
 */
@Component({
  selector: 'app-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, Header, Sidebar],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
})
export class Shell {
  private readonly taskStore = inject(TaskStore);
  private readonly userStore = inject(UserStore);

  // No auth in this app (out of scope per the brief) — the first user in
  // the mocked directory stands in for "the current user".
  readonly currentUser = computed(() => this.userStore.users()[0] ?? null);

  private readonly searchTerm = signal('');

  constructor() {
    toObservable(this.searchTerm)
      .pipe(debounceTime(SEARCH_DEBOUNCE_MS), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((term) => this.taskStore.setSearch(term));
  }

  onSearchChange(term: string): void {
    this.searchTerm.set(term);
  }
}
