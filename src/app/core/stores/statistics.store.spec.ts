import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import type { StatisticsResponse } from '../models/statistic.model';
import { flushResource } from '../testing/resource-test-utils';
import { API_BASE_URL } from '../tokens/api.tokens';
import { StatisticsStore } from './statistics.store';

const BASE_URL = '/api';

const RESPONSE: StatisticsResponse = {
  statistics: [
    {
      id: 'stat-001',
      title: 'Total Tasks',
      icon: '📊',
      value: 156,
      change: '+12',
      changeLabel: 'this week',
      changeType: 'positive',
      color: '#1976D2',
    },
  ],
  lastUpdated: '2026-09-04T00:00:00.000Z',
};

describe('StatisticsStore', () => {
  let store: StatisticsStore;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: BASE_URL },
      ],
    });
    store = TestBed.inject(StatisticsStore);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('starts with an empty statistics list before the request resolves', () => {
    expect(store.statistics()).toEqual([]);
    expect(store.lastUpdated()).toBe('');

    TestBed.tick();
    httpMock.expectOne(`${BASE_URL}/statistics`).flush(RESPONSE);
  });

  it('exposes the fetched statistics and lastUpdated as signals', async () => {
    TestBed.tick();
    httpMock.expectOne(`${BASE_URL}/statistics`).flush(RESPONSE);
    await flushResource();

    expect(store.statistics()).toEqual(RESPONSE.statistics);
    expect(store.lastUpdated()).toBe(RESPONSE.lastUpdated);
  });

  it('reload() re-issues the request', async () => {
    TestBed.tick();
    httpMock.expectOne(`${BASE_URL}/statistics`).flush(RESPONSE);
    await flushResource();

    store.reload();
    TestBed.tick();
    httpMock.expectOne(`${BASE_URL}/statistics`).flush(RESPONSE);
  });
});
