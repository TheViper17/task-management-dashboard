import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import type { Assignee } from '../models/task.model';
import { flushResource } from '../testing/resource-test-utils';
import { API_BASE_URL } from '../tokens/api.tokens';
import { UserStore } from './user.store';

const BASE_URL = '/api';

const USERS: Assignee[] = [
  { id: 'user-1', name: 'Ada Lovelace', avatar: 'AL', email: 'ada@company.com' },
  { id: 'user-2', name: 'Grace Hopper', avatar: 'GH', email: 'grace@company.com' },
];

describe('UserStore', () => {
  let store: UserStore;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: BASE_URL },
      ],
    });
    store = TestBed.inject(UserStore);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('starts with an empty user list before the request resolves', () => {
    expect(store.users()).toEqual([]);

    // Drain the resource's auto-dispatched initial request so afterEach's
    // httpMock.verify() doesn't see it as an unhandled outstanding request.
    TestBed.tick();
    httpMock.expectOne(`${BASE_URL}/users`).flush(USERS);
  });

  it('loads users via httpResource and exposes them as a signal', async () => {
    TestBed.tick();
    httpMock.expectOne(`${BASE_URL}/users`).flush(USERS);
    await flushResource();

    expect(store.users()).toEqual(USERS);
    expect(store.isLoading()).toBe(false);
  });

  it('findById() resolves a known assignee and returns undefined for an unknown one', async () => {
    TestBed.tick();
    httpMock.expectOne(`${BASE_URL}/users`).flush(USERS);
    await flushResource();

    expect(store.findById('user-1')).toEqual(USERS[0]);
    expect(store.findById('does-not-exist')).toBeUndefined();
  });

  it('reload() re-issues the request', async () => {
    TestBed.tick();
    httpMock.expectOne(`${BASE_URL}/users`).flush(USERS);
    await flushResource();

    store.reload();
    TestBed.tick();
    httpMock.expectOne(`${BASE_URL}/users`).flush(USERS);
  });
});
