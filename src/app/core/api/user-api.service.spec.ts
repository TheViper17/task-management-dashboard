import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import type { Assignee } from '../models/task.model';
import { API_BASE_URL } from '../tokens/api.tokens';
import { UserApiService } from './user-api.service';

const BASE_URL = '/api';

describe('UserApiService', () => {
  let service: UserApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: BASE_URL },
      ],
    });
    service = TestBed.inject(UserApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('getAll() issues a GET to /api/users', () => {
    const expected: Assignee[] = [
      { id: 'user-1', name: 'Ada Lovelace', avatar: 'AL', email: 'ada@company.com' },
    ];
    service.getAll().subscribe((users) => expect(users).toEqual(expected));

    const req = httpMock.expectOne(`${BASE_URL}/users`);
    expect(req.request.method).toBe('GET');
    req.flush(expected);
  });
});
