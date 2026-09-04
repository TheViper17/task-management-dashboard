import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import type { AppError } from '../models/app-error.model';
import { NotificationService } from '../services/notification.service';
import { errorInterceptor } from './error.interceptor';

describe('errorInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let notifySpy: { showError: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    notifySpy = { showError: vi.fn() };
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
        { provide: NotificationService, useValue: notifySpy },
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('passes a successful response through untouched', () => {
    let result: unknown;
    http.get('/api/tasks').subscribe((r) => (result = r));

    httpMock.expectOne('/api/tasks').flush([{ id: 'task-1' }]);

    expect(result).toEqual([{ id: 'task-1' }]);
    expect(notifySpy.showError).not.toHaveBeenCalled();
  });

  it('maps a failed request to an AppError and notifies the user', () => {
    let error: AppError | undefined;
    http.get('/api/tasks').subscribe({ error: (e: AppError) => (error = e) });

    httpMock.expectOne('/api/tasks').flush(null, { status: 404, statusText: 'Not Found' });

    expect(error).toEqual(expect.objectContaining({ kind: 'not-found' }));
    expect(notifySpy.showError).toHaveBeenCalledWith(error?.message);
  });
});
