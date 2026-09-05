import { httpResource } from '@angular/common/http';
import { Injectable, computed, inject } from '@angular/core';
import type { StatisticsResponse } from '../models/statistic.model';
import { API_BASE_URL } from '../tokens/api.tokens';

const EMPTY_RESPONSE: StatisticsResponse = { statistics: [], lastUpdated: '' };

/**
 * The 4 dashboard stat cards, straight from the mock API. Not recomputed
 * from TaskStore's live tasks — the seeded change/changeLabel deltas
 * ("+12 this week") don't exist anywhere else, so they come from the
 * backend as-is. Live counts elsewhere (board column badges, etc.) come
 * from task.utils#deriveTaskCounts instead.
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
