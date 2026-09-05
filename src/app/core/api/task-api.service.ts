import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import type { Assignee, CreateTaskDto, Task, TaskPatch } from '../models/task.model';
import { API_BASE_URL } from '../tokens/api.tokens';

/**
 * Typed HTTP boundary for the tasks resource. No state and no business
 * logic here on purpose — TaskStore owns state, this just knows how to
 * talk to the mock backend. Every method returns an Observable and lets
 * cacheInterceptor/retryInterceptor/errorInterceptor do their job upstream.
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
   * assignee gets added onto the request body when it's provided.
   * CreateTaskDto only carries assigneeId, and this mock backend can't do
   * relational joins, so a bare POST would leave the task with no
   * embedded assignee at all — and every card template reads
   * task.assignee.name/.avatar. A real backend would resolve this
   * server-side; here the caller (TaskStore, which already has UserStore)
   * resolves it and this just forwards it along.
   *
   * createdAt/updatedAt get stamped here for the same reason — json-server
   * has no insert trigger, so a bare POST leaves both fields missing.
   * Found this live: creating a task and reloading crashed
   * ActivityStore.seedIfEmpty's sort on undefined.localeCompare(). A real
   * backend would stamp these itself; here the client has to.
   */
  create(dto: CreateTaskDto, assignee?: Assignee): Observable<Task> {
    const now = new Date().toISOString();
    const body = { ...dto, createdAt: now, updatedAt: now, ...(assignee && { assignee }) };
    return this.http.post<Task>(`${this.baseUrl}/tasks`, body);
  }

  /**
   * Same reasoning as create() for assignee. updatedAt gets stamped fresh
   * on every patch, not just reassignments — a PATCH only overwrites what
   * it sends, so without this the stored updatedAt would go stale after
   * every real edit, including drag-and-drop moves (TaskStore.move() uses
   * this same method).
   */
  update(id: string, patch: TaskPatch, assignee?: Assignee): Observable<Task> {
    const body = { ...patch, updatedAt: new Date().toISOString(), ...(assignee && { assignee }) };
    return this.http.patch<Task>(`${this.baseUrl}/tasks/${id}`, body);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/tasks/${id}`);
  }
}
