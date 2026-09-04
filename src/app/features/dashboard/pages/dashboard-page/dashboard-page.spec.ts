import { MatDialog } from '@angular/material/dialog';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { of } from 'rxjs';
import type { Task, TaskFilters } from '../../../../core/models/task.model';
import { DEFAULT_TASK_FILTERS } from '../../../../core/models/task.model';
import { StatisticsStore } from '../../../../core/stores/statistics.store';
import { TaskStore } from '../../../../core/stores/task.store';
import { TaskDialogService } from '../../../tasks/task-dialog.service';
import { DashboardPage } from './dashboard-page';

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'task-1',
    title: 'Design homepage',
    description: 'desc',
    status: 'todo',
    priority: 'high',
    dueDate: '2026-09-20',
    isOverdue: false,
    assignee: { id: 'user-1', name: 'Sarah Smith', avatar: 'SS', email: 'sarah@company.com' },
    assigneeId: 'user-1',
    tags: ['Design'],
    order: 0,
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('DashboardPage', () => {
  let taskStoreStub: {
    filters: () => TaskFilters;
    columns: () => Record<string, Task[]>;
    counts: () => { total: number; completed: number; inProgress: number; overdue: number };
    tasks: () => Task[];
    isLoading: () => boolean;
    error: () => Error | undefined;
    setFilters: ReturnType<typeof vi.fn>;
    remove: ReturnType<typeof vi.fn>;
    reload: ReturnType<typeof vi.fn>;
    move: ReturnType<typeof vi.fn>;
  };
  let statisticsStoreStub: { statistics: () => unknown[] };
  let dialogOpenSpy: ReturnType<typeof vi.fn>;
  let taskDialogStub: { createTask: ReturnType<typeof vi.fn>; editTask: ReturnType<typeof vi.fn> };

  interface SetupOptions {
    todoTasks?: Task[];
    isLoading?: boolean;
    error?: Error;
  }

  function setup(options: SetupOptions = {}): ReturnType<typeof render<DashboardPage>> {
    const { todoTasks = [], isLoading = false, error = undefined } = options;
    taskStoreStub = {
      filters: () => DEFAULT_TASK_FILTERS,
      columns: () => ({ todo: todoTasks, in_progress: [], done: [] }),
      counts: () => ({ total: todoTasks.length, completed: 0, inProgress: 0, overdue: 0 }),
      tasks: () => todoTasks,
      isLoading: () => isLoading,
      error: () => error,
      setFilters: vi.fn(),
      remove: vi.fn().mockResolvedValue(undefined),
      reload: vi.fn(),
      move: vi.fn().mockResolvedValue(undefined),
    };
    statisticsStoreStub = { statistics: () => [] };
    dialogOpenSpy = vi.fn();
    taskDialogStub = { createTask: vi.fn(), editTask: vi.fn() };

    return render(DashboardPage, {
      providers: [
        { provide: TaskStore, useValue: taskStoreStub },
        { provide: StatisticsStore, useValue: statisticsStoreStub },
        { provide: MatDialog, useValue: { open: dialogOpenSpy } },
        { provide: TaskDialogService, useValue: taskDialogStub },
      ],
    });
  }

  it('renders all three board columns', async () => {
    await setup();
    expect(screen.getByText('TO DO')).toBeInTheDocument();
    expect(screen.getByText('IN PROGRESS')).toBeInTheDocument();
    expect(screen.getByText('DONE')).toBeInTheDocument();
  });

  it('calls TaskStore.setFilters when a status tab is clicked', async () => {
    const user = userEvent.setup();
    await setup();

    await user.click(screen.getByText('Done'));

    expect(taskStoreStub.setFilters).toHaveBeenCalledWith({ status: 'done' });
  });

  it('delegates "New Task" to TaskDialogService.createTask()', async () => {
    const user = userEvent.setup();
    await setup();

    await user.click(screen.getByRole('button', { name: /new task/i }));

    expect(taskDialogStub.createTask).toHaveBeenCalled();
  });

  it('delegates a card\'s "Edit" to TaskDialogService.editTask() with that task', async () => {
    const user = userEvent.setup();
    const task = makeTask({ id: 'task-1' });
    await setup({ todoTasks: [task] });

    await user.click(screen.getByRole('button', { name: /more actions/i }));
    await user.click(await screen.findByRole('menuitem', { name: /edit/i }));

    expect(taskDialogStub.editTask).toHaveBeenCalledWith(task);
  });

  it('opens a confirm dialog and calls TaskStore.remove when confirmed', async () => {
    const user = userEvent.setup();
    await setup({ todoTasks: [makeTask({ id: 'task-1', title: 'Design homepage' })] });
    dialogOpenSpy.mockReturnValue({ afterClosed: () => of(true) });

    await user.click(screen.getByRole('button', { name: /more actions/i }));
    await user.click(await screen.findByRole('menuitem', { name: /delete/i }));

    expect(dialogOpenSpy).toHaveBeenCalled();
    expect(taskStoreStub.remove).toHaveBeenCalledWith('task-1');
  });

  it('does not call TaskStore.remove when the confirm dialog is cancelled', async () => {
    const user = userEvent.setup();
    await setup({ todoTasks: [makeTask({ id: 'task-1', title: 'Design homepage' })] });
    dialogOpenSpy.mockReturnValue({ afterClosed: () => of(false) });

    await user.click(screen.getByRole('button', { name: /more actions/i }));
    await user.click(await screen.findByRole('menuitem', { name: /delete/i }));

    expect(taskStoreStub.remove).not.toHaveBeenCalled();
  });

  describe('loading and error states', () => {
    it('shows a skeleton instead of the board on the initial load (no tasks yet)', async () => {
      await setup({ isLoading: true });

      expect(screen.getByRole('status', { name: /loading dashboard/i })).toBeInTheDocument();
      expect(screen.queryByText('TO DO')).not.toBeInTheDocument();
    });

    it('does not show the skeleton on a later reload once tasks are already loaded', async () => {
      await setup({ todoTasks: [makeTask()], isLoading: true });

      expect(screen.queryByRole('status', { name: /loading dashboard/i })).not.toBeInTheDocument();
      expect(screen.getByText('TO DO')).toBeInTheDocument();
    });

    it('shows an error state with a Retry button when the load fails', async () => {
      const user = userEvent.setup();
      await setup({ error: new Error('network down') });

      expect(screen.getByRole('alert')).toHaveTextContent(/couldn't load your tasks/i);
      expect(screen.queryByText('TO DO')).not.toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: /retry/i }));
      expect(taskStoreStub.reload).toHaveBeenCalled();
    });
  });

  // Drag-and-drop's reorder math (computeTaskOrderPatches) is pure and
  // tested directly in board-drag-drop.utils.spec.ts — no fake pointer
  // events or component rendering needed there. onTaskMoved itself is a
  // one-line adapter (apply whatever patches that function returns), and
  // was verified live in a real browser (see the phase notes) rather than
  // duplicating that coverage here.
});
