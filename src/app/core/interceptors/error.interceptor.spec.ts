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

  it('notifies with the translated static message, not the raw English fallback text', () => {
    // Arabic's wording differs from AppError#message, so this only passes
    // if the interceptor actually asked TranslationService for it rather
    // than just forwarding message. TranslationService is providedIn:
    // 'root' and only built on first inject() — which happens below, inside
    // the interceptor — so setting the locale here first is enough.
    localStorage.setItem('task-dashboard:locale', 'ar');

    http.get('/api/tasks').subscribe({ error: () => undefined });
    httpMock.expectOne('/api/tasks').flush(null, { status: 404, statusText: 'Not Found' });

    expect(notifySpy.showError).toHaveBeenCalledWith('تعذّر العثور على العنصر المطلوب.');

    // TranslationService sets document.documentElement.dir/lang directly,
    // outside Angular's DI, so TestBed's teardown won't undo it — reset by
    // hand so it doesn't leak into the next test in this file.
    localStorage.clear();
    document.documentElement.removeAttribute('dir');
    document.documentElement.lang = 'en';
  });

  it('notifies with the raw server-supplied message untranslated, when one is present', () => {
    let error: AppError | undefined;
    http.get('/api/tasks').subscribe({ error: (e: AppError) => (error = e) });

    httpMock
      .expectOne('/api/tasks')
      .flush({ message: 'Title is required' }, { status: 422, statusText: 'Unprocessable' });

    expect(error?.messageKey).toBeUndefined();
    expect(notifySpy.showError).toHaveBeenCalledWith('Title is required');
  });
});
