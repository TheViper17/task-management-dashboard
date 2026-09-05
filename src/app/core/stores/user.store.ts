import { httpResource } from '@angular/common/http';
import { Injectable, computed, inject } from '@angular/core';
import type { Assignee } from '../models/task.model';
import { API_BASE_URL } from '../tokens/api.tokens';

/**
 * Read-only directory of assignees, backed by httpResource. Feeds the
 * assignee dropdowns (forms, filters) and resolves an assigneeId to a
 * real Assignee for optimistic task cards.
 */
@Injectable({ providedIn: 'root' })
export class UserStore {
  private readonly baseUrl = inject(API_BASE_URL);

  private readonly resource = httpResource<Assignee[]>(() => `${this.baseUrl}/users`, {
    defaultValue: [],
  });

  readonly users = computed(() => this.resource.value());
  readonly isLoading = this.resource.isLoading;
  readonly error = this.resource.error;

  findById(id: string): Assignee | undefined {
    return this.users().find((user) => user.id === id);
  }

  reload(): void {
    this.resource.reload();
  }
}
