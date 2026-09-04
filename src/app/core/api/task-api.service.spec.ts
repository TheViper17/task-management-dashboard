import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import type { CreateTaskDto, Task } from '../models/task.model';
import { API_BASE_URL } from '../tokens/api.tokens';
import { TaskApiService } from './task-api.service';

const BASE_URL = '/api';

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'task-1',
    title: 'Design homepage',
    description: 'Create wireframes',
    status: 'todo',
    priority: 'high',
    dueDate: '2026-09-10',
    isOverdue: false,
    assignee: { id: 'user-1', name: 'Ada Lovelace', avatar: 'AL', email: 'ada@company.com' },
    assigneeId: 'user-1',
    tags: ['Design'],
    order: 0,
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('TaskApiService', () => {
  let service: TaskApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: BASE_URL },
      ],
    });
    service = TestBed.inject(TaskApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('getAll() issues a GET to /api/tasks', () => {
    const expected = [makeTask()];
    service.getAll().subscribe((tasks) => expect(tasks).toEqual(expected));

    const req = httpMock.expectOne(`${BASE_URL}/tasks`);
    expect(req.request.method).toBe('GET');
    req.flush(expected);
  });

  it('getById() issues a GET to /api/tasks/:id', () => {
    const expected = makeTask({ id: 'task-42' });
    service.getById('task-42').subscribe((task) => expect(task).toEqual(expected));

    const req = httpMock.expectOne(`${BASE_URL}/tasks/task-42`);
    expect(req.request.method).toBe('GET');
    req.flush(expected);
  });

  it('create() POSTs the DTO to /api/tasks', () => {
    const dto: CreateTaskDto = {
      title: 'New task',
      description: 'desc',
      status: 'todo',
      priority: 'low',
      dueDate: '2026-09-20',
      assigneeId: 'user-1',
      tags: [],
    };
    const created = makeTask({ id: 'task-99', ...dto });
    service.create(dto).subscribe((task) => expect(task).toEqual(created));

    const req = httpMock.expectOne(`${BASE_URL}/tasks`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(dto);
    req.flush(created);
  });

  it('update() PATCHes the partial DTO to /api/tasks/:id', () => {
    const patch = { status: 'in_progress' as const };
    const updated = makeTask({ status: 'in_progress' });
    service.update('task-1', patch).subscribe((task) => expect(task).toEqual(updated));

    const req = httpMock.expectOne(`${BASE_URL}/tasks/task-1`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual(patch);
    req.flush(updated);
  });

  it('delete() issues a DELETE to /api/tasks/:id', () => {
    service.delete('task-1').subscribe();

    const req = httpMock.expectOne(`${BASE_URL}/tasks/task-1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
