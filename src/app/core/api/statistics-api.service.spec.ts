import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import type { StatisticsResponse } from '../models/statistic.model';
import { API_BASE_URL } from '../tokens/api.tokens';
import { StatisticsApiService } from './statistics-api.service';

const BASE_URL = '/api';

describe('StatisticsApiService', () => {
  let service: StatisticsApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: BASE_URL },
      ],
    });
    service = TestBed.inject(StatisticsApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('getAll() issues a GET to /api/statistics', () => {
    const expected: StatisticsResponse = {
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
    service.getAll().subscribe((res) => expect(res).toEqual(expected));

    const req = httpMock.expectOne(`${BASE_URL}/statistics`);
    expect(req.request.method).toBe('GET');
    req.flush(expected);
  });
});
