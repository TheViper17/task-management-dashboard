import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import type { Assignee, CreateTaskDto } from '../../../../core/models/task.model';
import { TaskFormDialog } from './task-form-dialog';
import type { TaskFormDialogData } from './task-form-dialog';

const ASSIGNEES: Assignee[] = [
  { id: 'user-1', name: 'Ada Lovelace', avatar: 'AL', email: 'ada@company.com' },
];

describe('TaskFormDialog', () => {
  let closeSpy: ReturnType<typeof vi.fn>;

  async function setup(data: TaskFormDialogData): Promise<unknown> {
    closeSpy = vi.fn();
    return render(TaskFormDialog, {
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: MatDialogRef, useValue: { close: closeSpy } },
      ],
    });
  }

  it('titles the dialog "New Task" when there is no task', async () => {
    await setup({ task: null, assignees: ASSIGNEES });
    expect(screen.getByRole('heading', { name: 'New Task' })).toBeInTheDocument();
  });

  it('titles the dialog "Edit Task" when a task is given', async () => {
    await setup({
      task: {
        id: 'task-1',
        title: 'x',
        description: 'y',
        status: 'todo',
        priority: 'low',
        dueDate: '2026-09-10',
        isOverdue: false,
        assignee: ASSIGNEES[0],
        assigneeId: 'user-1',
        tags: [],
        order: 0,
        createdAt: '2026-09-01T00:00:00.000Z',
        updatedAt: '2026-09-01T00:00:00.000Z',
      },
      assignees: ASSIGNEES,
    });
    expect(screen.getByRole('heading', { name: 'Edit Task' })).toBeInTheDocument();
  });

  it("closes the dialog with the DTO when the form's save fires", async () => {
    const user = userEvent.setup();
    await setup({ task: null, assignees: ASSIGNEES });

    await user.type(screen.getByLabelText('Title'), 'New task');
    await user.type(screen.getByLabelText('Description'), 'A sufficiently long description');
    await user.type(screen.getByLabelText('Due date'), '2099-01-01');
    await user.click(screen.getByRole('combobox', { name: 'Assignee' }));
    await user.click(await screen.findByRole('option', { name: 'Ada Lovelace' }));
    await user.click(screen.getByRole('button', { name: 'Create Task' }));

    expect(closeSpy).toHaveBeenCalledTimes(1);
    const [dto] = closeSpy.mock.calls[0] as [CreateTaskDto];
    expect(dto.title).toBe('New task');
  });

  it("closes the dialog with no value when the form's cancel fires", async () => {
    const user = userEvent.setup();
    await setup({ task: null, assignees: ASSIGNEES });

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(closeSpy).toHaveBeenCalledWith();
  });
});
