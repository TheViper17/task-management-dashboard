import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import type { Assignee, CreateTaskDto, Task, TaskPatch } from '../models/task.model';
import { API_BASE_URL } from '../tokens/api.tokens';

/**
 * Typed HTTP boundary for the `tasks` resource. Deliberately has no state
 * and no business logic (SRP) — `TaskStore` owns state, this service only
 * knows how to talk to the mock backend. Every method returns an
 * `Observable` and lets `cacheInterceptor` / `retryInterceptor` /
 * `errorInterceptor` do their job upstream.
 */
@Injectable({ providedIn: 'root' })
export class TaskApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  getAll(): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.baseUrl}/tasks`);
  }

  getById(id: string): Observable<Task> {
    return this.http.get<Task>(`${this.baseUrl}/tasks/${id}`);
  }

  /**
   * `assignee` is denormalized onto the request body when provided —
   * `CreateTaskDto` only carries `assigneeId`, but this mock backend has no
   * server-side relational join, so a bare POST would persist a task with
   * `assigneeId` and no embedded `assignee` at all, which every card
   * template reads (`task.assignee.name`, `.avatar`). A real backend would
   * resolve this server-side; here, the caller (`TaskStore`, which already
   * has `UserStore`) resolves it and this method just forwards it.
   *
   * `createdAt`/`updatedAt` are stamped here for the same reason: json-server
   * has no insert trigger, so a bare POST persists a task with neither field
   * at all — found live by creating a task and reloading, which crashed
   * `ActivityStore.seedIfEmpty`'s `updatedAt.localeCompare()` sort on the
   * very next fresh load. A real backend would stamp these server-side; here
   * the client must, since nothing else will.
   */
  create(dto: CreateTaskDto, assignee?: Assignee): Observable<Task> {
    const now = new Date().toISOString();
    const body = { ...dto, createdAt: now, updatedAt: now, ...(assignee && { assignee }) };
    return this.http.post<Task>(`${this.baseUrl}/tasks`, body);
  }

  /**
   * See `create()`'s doc comment — same reasoning for `assignee`. `updatedAt`
   * is likewise stamped fresh on every patch (not just reassignment): a
   * PATCH only overwrites the fields it sends, so without this the stored
   * `updatedAt` would silently go stale after every real edit, including
   * drag-and-drop moves (`TaskStore.move()` shares this method).
   */
  update(id: string, patch: TaskPatch, assignee?: Assignee): Observable<Task> {
    const body = { ...patch, updatedAt: new Date().toISOString(), ...(assignee && { assignee }) };
    return this.http.patch<Task>(`${this.baseUrl}/tasks/${id}`, body);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/tasks/${id}`);
  }
}
