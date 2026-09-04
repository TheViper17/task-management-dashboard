import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import type { Assignee } from '../models/task.model';
import { API_BASE_URL } from '../tokens/api.tokens';

/** Typed HTTP boundary for the `users` resource (mocked assignee directory). */
@Injectable({ providedIn: 'root' })
export class UserApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  getAll(): Observable<Assignee[]> {
    return this.http.get<Assignee[]>(`${this.baseUrl}/users`);
  }
}
