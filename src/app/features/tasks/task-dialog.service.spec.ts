import { MatDialog } from '@angular/material/dialog';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import type { Assignee, CreateTaskDto, Task } from '../../core/models/task.model';
import { NotificationService } from '../../core/services/notification.service';
import { TaskStore } from '../../core/stores/task.store';
import { UserStore } from '../../core/stores/user.store';
import { TaskFormDialog } from './components/task-form-dialog/task-form-dialog';
import { TaskDialogService } from './task-dialog.service';

const ASSIGNEE: Assignee = {
  id: 'user-1',
  name: 'Ada Lovelace',
  avatar: 'AL',
  email: 'ada@company.com',
};

const DTO: CreateTaskDto = {
  title: 'Write onboarding docs',
  description: 'desc',
  status: 'todo',
  priority: 'low',
  dueDate: '2026-09-20',
  assigneeId: 'user-1',
  tags: [],
};

function makeTask(): Task {
  return {
    id: 'task-1',
    title: 'Design homepage',
    description: 'desc',
    status: 'todo',
    priority: 'high',
    dueDate: '2026-09-10',
    isOverdue: false,
    assignee: ASSIGNEE,
    assigneeId: ASSIGNEE.id,
    tags: [],
    order: 0,
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
  };
}

describe('TaskDialogService', () => {
  let dialogOpenSpy: ReturnType<typeof vi.fn>;
  let taskStoreStub: { create: ReturnType<typeof vi.fn>; update: ReturnType<typeof vi.fn> };
  let notifySpy: { showSuccess: ReturnType<typeof vi.fn> };
  let service: TaskDialogService;

  beforeEach(() => {
    dialogOpenSpy = vi.fn().mockReturnValue({ afterClosed: () => of(undefined) });
    taskStoreStub = {
      create: vi.fn().mockResolvedValue(undefined),
      update: vi.fn().mockResolvedValue(undefined),
    };
    notifySpy = { showSuccess: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        { provide: MatDialog, useValue: { open: dialogOpenSpy } },
        { provide: UserStore, useValue: { users: () => [ASSIGNEE] } },
        { provide: TaskStore, useValue: taskStoreStub },
        { provide: NotificationService, useValue: notifySpy },
      ],
    });
    service = TestBed.inject(TaskDialogService);
  });

  describe('createTask', () => {
    it('opens the dialog with task: null and the current assignees', () => {
      service.createTask();

      expect(dialogOpenSpy).toHaveBeenCalledWith(
        TaskFormDialog,
        expect.objectContaining({ data: { task: null, assignees: [ASSIGNEE] } }),
      );
    });

    it('creates the task and shows a success notice when the dialog resolves with a DTO', async () => {
      dialogOpenSpy.mockReturnValue({ afterClosed: () => of(DTO) });

      service.createTask();
      await Promise.resolve();
      await Promise.resolve();

      expect(taskStoreStub.create).toHaveBeenCalledWith(DTO);
      expect(notifySpy.showSuccess).toHaveBeenCalledWith('Task created.');
    });

    it('does nothing when the dialog resolves with no value', () => {
      service.createTask(); // default stub resolves undefined
      expect(taskStoreStub.create).not.toHaveBeenCalled();
    });
  });

  describe('editTask', () => {
    it('opens the dialog with the given task', () => {
      const task = makeTask();
      service.editTask(task);

      expect(dialogOpenSpy).toHaveBeenCalledWith(
        TaskFormDialog,
        expect.objectContaining({ data: { task, assignees: [ASSIGNEE] } }),
      );
    });

    it('updates the task and shows a success notice when the dialog resolves with a DTO', async () => {
      dialogOpenSpy.mockReturnValue({ afterClosed: () => of(DTO) });
      const task = makeTask();

      service.editTask(task);
      await Promise.resolve();
      await Promise.resolve();

      expect(taskStoreStub.update).toHaveBeenCalledWith('task-1', DTO);
      expect(notifySpy.showSuccess).toHaveBeenCalledWith('Task updated.');
    });
  });
});
