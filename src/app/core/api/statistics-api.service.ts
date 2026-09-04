import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import type { StatisticsResponse } from '../models/statistic.model';
import { API_BASE_URL } from '../tokens/api.tokens';

/** Typed HTTP boundary for the `statistics` resource (the 4 dashboard cards). */
@Injectable({ providedIn: 'root' })
export class StatisticsApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  getAll(): Observable<StatisticsResponse> {
    return this.http.get<StatisticsResponse>(`${this.baseUrl}/statistics`);
  }
}
