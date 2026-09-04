import { httpResource } from '@angular/common/http';
import { Injectable, computed, inject } from '@angular/core';
import type { StatisticsResponse } from '../models/statistic.model';
import { API_BASE_URL } from '../tokens/api.tokens';

const EMPTY_RESPONSE: StatisticsResponse = { statistics: [], lastUpdated: '' };

/**
 * The 4 dashboard stat cards, as returned by the mock API. This is
 * deliberately *not* recomputed from `TaskStore`'s live task list — the
 * seeded `change` / `changeLabel` deltas ("+12 this week") don't exist
 * anywhere else, so they're sourced from the backend as-is. The live task
 * counts used elsewhere (e.g. board column badges) come from
 * `task.utils#deriveTaskCounts` instead.
 */
@Injectable({ providedIn: 'root' })
export class StatisticsStore {
  private readonly baseUrl = inject(API_BASE_URL);

  private readonly resource = httpResource<StatisticsResponse>(() => `${this.baseUrl}/statistics`, {
    defaultValue: EMPTY_RESPONSE,
  });

  readonly statistics = computed(() => this.resource.value().statistics);
  readonly lastUpdated = computed(() => this.resource.value().lastUpdated);
  readonly isLoading = this.resource.isLoading;
  readonly error = this.resource.error;

  reload(): void {
    this.resource.reload();
  }
}
