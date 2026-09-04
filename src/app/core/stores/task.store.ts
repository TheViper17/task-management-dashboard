import { httpResource } from '@angular/common/http';
import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { TaskApiService } from '../api/task-api.service';
import type { CreateTaskDto, Task, TaskFilters, TaskPatch, TaskStatus } from '../models/task.model';
import { DEFAULT_TASK_FILTERS } from '../models/task.model';
import { API_BASE_URL } from '../tokens/api.tokens';
import {
  applyTaskPatch,
  countByPriority,
  countByStatus,
  createOptimisticTask,
  deriveTaskCounts,
  filterTasks,
  groupByStatus,
} from '../utils/task.utils';
import { ActivityStore } from './activity.store';
import { UserStore } from './user.store';

/**
 * Single source of truth for task state. Every read the UI needs is a
 * `computed()` derived from one `httpResource`-backed array — nothing is
 * stored twice, so nothing can go stale relative to it. Every write is a
 * command method that applies an optimistic update, calls the API, and
 * either reconciles with the server's response or rolls back on failure.
 *
 * Components never touch a signal directly; they read the `readonly`
 * signals below and call these commands. That one-way flow is what makes
 * the store's behaviour predictable without an NgRx-style action log.
 */
@Injectable({ providedIn: 'root' })
export class TaskStore {
  private readonly api = inject(TaskApiService);
  private readonly activity = inject(ActivityStore);
  private readonly userStore = inject(UserStore);
  private readonly baseUrl = inject(API_BASE_URL);

  private readonly resource = httpResource<Task[]>(() => `${this.baseUrl}/tasks`, {
    defaultValue: [],
  });

  private readonly _filters = signal<TaskFilters>(DEFAULT_TASK_FILTERS);
  private readonly _search = signal('');
  private hasSeededActivity = false;

  // ---- reads -----------------------------------------------------------
  readonly tasks = computed(() => this.resource.value());
  readonly isLoading = this.resource.isLoading;
  readonly error = this.resource.error;
  readonly filters = this._filters.asReadonly();
  readonly search = this._search.asReadonly();

  readonly filteredTasks = computed(() =>
    filterTasks(this.tasks(), this._filters(), this._search()),
  );
  readonly columns = computed(() => groupByStatus(this.filteredTasks()));
  readonly counts = computed(() => deriveTaskCounts(this.tasks()));
  readonly priorityMix = computed(() => countByPriority(this.tasks()));
  readonly statusMix = computed(() => countByStatus(this.tasks()));

  constructor() {
    // Once the initial fetch resolves, backfill the activity feed from it —
    // exactly once. Guarded by a plain flag (not a signal) since this is a
    // one-time side effect, not derived state.
    effect(() => {
      const tasks = this.resource.value();
      if (!this.hasSeededActivity && this.resource.status() === 'resolved' && tasks.length > 0) {
        this.hasSeededActivity = true;
        this.activity.seedIfEmpty(tasks);
      }
    });
  }

  // ---- filter / search commands -----------------------------------------
  setSearch(term: string): void {
    this._search.set(term);
  }

  setFilters(patch: Partial<TaskFilters>): void {
    this._filters.update((current) => ({ ...current, ...patch }));
  }

  resetFilters(): void {
    this._filters.set(DEFAULT_TASK_FILTERS);
    this._search.set('');
  }

  reload(): void {
    this.resource.reload();
  }

  // ---- mutation commands -------------------------------------------------

  /**
   * Creates a task. If the assignee is already known (the common case),
   * inserts an optimistic placeholder immediately and swaps it for the
   * server's response; removes it again if the request fails.
   */
  async create(dto: CreateTaskDto): Promise<Task> {
    const assignee = this.userStore.findById(dto.assigneeId);
    if (!assignee) {
      const created = await firstValueFrom(this.api.create(dto));
      this.resource.update((tasks) => [created, ...tasks]);
      this.activity.record('created', created);
      return created;
    }

    const optimistic = createOptimisticTask(dto, assignee, this.tasks());
    this.resource.update((tasks) => [optimistic, ...tasks]);

    try {
      const created = await firstValueFrom(this.api.create(dto, assignee));
      // Overlay the resolved assignee regardless of what the server echoed
      // back — belt-and-braces alongside the API service sending it on the
      // wire, since a template that reads `task.assignee.name` must never
      // see this field missing.
      const reconciled: Task = { ...created, assignee };
      this.resource.update((tasks) => tasks.map((t) => (t.id === optimistic.id ? reconciled : t)));
      this.activity.record('created', reconciled);
      return reconciled;
    } catch (err) {
      this.resource.update((tasks) => tasks.filter((t) => t.id !== optimistic.id));
      throw err;
    }
  }

  /** Applies a field patch (edit modal / inline edit), optimistically. */
  async update(id: string, patch: TaskPatch): Promise<Task> {
    const previous = this.tasks();
    this.resource.update((tasks) => tasks.map((t) => (t.id === id ? applyTaskPatch(t, patch) : t)));

    // Only resolved when the patch actually reassigns the task — see
    // TaskApiService.update's doc comment for why this needs sending at all.
    const assignee = patch.assigneeId ? this.userStore.findById(patch.assigneeId) : undefined;

    try {
      const updated = await firstValueFrom(this.api.update(id, patch, assignee));
      const reconciled = assignee ? { ...updated, assignee } : updated;
      this.resource.update((tasks) => tasks.map((t) => (t.id === id ? reconciled : t)));
      this.activity.record('updated', reconciled);
      return reconciled;
    } catch (err) {
      this.resource.set(previous);
      throw err;
    }
  }

  /** Deletes a task, optimistically removing it from the board. */
  async remove(id: string): Promise<void> {
    const previous = this.tasks();
    const removed = previous.find((t) => t.id === id);
    this.resource.update((tasks) => tasks.filter((t) => t.id !== id));

    try {
      await firstValueFrom(this.api.delete(id));
      if (removed) this.activity.record('deleted', removed);
    } catch (err) {
      this.resource.set(previous);
      throw err;
    }
  }

  /** Drag-and-drop: changes a task's status and/or board position. */
  async move(id: string, status: TaskStatus, order: number): Promise<Task> {
    const previous = this.tasks();
    const patch: TaskPatch = { status, order };
    this.resource.update((tasks) => tasks.map((t) => (t.id === id ? applyTaskPatch(t, patch) : t)));

    try {
      const updated = await firstValueFrom(this.api.update(id, patch));
      this.resource.update((tasks) => tasks.map((t) => (t.id === id ? updated : t)));
      this.activity.record('moved', updated);
      return updated;
    } catch (err) {
      this.resource.set(previous);
      throw err;
    }
  }
}
