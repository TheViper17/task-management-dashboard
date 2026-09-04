import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import type { CreateTaskDto, Task, TaskPatch } from '../models/task.model';
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

  create(dto: CreateTaskDto): Observable<Task> {
    return this.http.post<Task>(`${this.baseUrl}/tasks`, dto);
  }

  update(id: string, patch: TaskPatch): Observable<Task> {
    return this.http.patch<Task>(`${this.baseUrl}/tasks/${id}`, patch);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/tasks/${id}`);
  }
}
