import { Injectable, signal } from '@angular/core';
import type { ActivityEntry, ActivityType } from '../models/activity.model';
import type { Task } from '../models/task.model';
import { generateId } from '../utils/id.utils';

const STORAGE_KEY = 'task-dashboard:activity-feed';
const MAX_ENTRIES = 50;
const SEED_COUNT = 10;

/**
 * Recent-activity feed. The mock API has no activity collection, so this
 * store synthesises one:
 *
 *  - On first load, `seedIfEmpty()` backfills the feed from the most
 *    recently updated tasks (called once by `TaskStore` after its initial
 *    fetch resolves).
 *  - From then on, `record()` appends an entry every time `TaskStore`
 *    completes a create/update/move/delete.
 *
 * Entries persist to `localStorage` so the feed survives a refresh; reads
 * and writes are wrapped in try/catch because storage can be unavailable
 * (private browsing, quota, disabled by policy) without that being a reason
 * for the feed to stop working for the rest of the session.
 */
@Injectable({ providedIn: 'root' })
export class ActivityStore {
  private readonly _entries = signal<ActivityEntry[]>(loadFromStorage());

  readonly entries = this._entries.asReadonly();

  seedIfEmpty(tasks: readonly Task[]): void {
    if (this._entries().length > 0 || tasks.length === 0) return;

    const seeded = [...tasks]
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .slice(0, SEED_COUNT)
      .map(toSeedEntry);

    this._entries.set(seeded);
    persist(seeded);
  }

  record(type: ActivityType, task: Task, detail?: string): void {
    const entry: ActivityEntry = {
      id: generateId(),
      type,
      taskId: task.id,
      taskTitle: task.title,
      detail,
      at: new Date().toISOString(),
    };
    const next = [entry, ...this._entries()].slice(0, MAX_ENTRIES);
    this._entries.set(next);
    persist(next);
  }

  clear(): void {
    this._entries.set([]);
    persist([]);
  }
}

function toSeedEntry(task: Task): ActivityEntry {
  return {
    id: generateId(),
    type: task.status === 'done' ? 'completed' : 'updated',
    taskId: task.id,
    taskTitle: task.title,
    at: task.updatedAt,
  };
}

function loadFromStorage(): ActivityEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ActivityEntry[]) : [];
  } catch {
    return [];
  }
}

function persist(entries: ActivityEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // Storage unavailable — the feed still works in-memory for this session.
  }
}
