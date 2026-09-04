import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import type { Task } from '../../../../core/models/task.model';
import { BoardColumn } from './board-column';

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

describe('BoardColumn', () => {
  it('renders the title and a count badge matching the task count', async () => {
    await render(BoardColumn, {
      inputs: {
        title: 'To Do',
        status: 'todo',
        tasks: [makeTask({ id: '1' }), makeTask({ id: '2' })],
      },
    });
    expect(screen.getByText('To Do')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('labels the column region with its title, not the title() function itself', async () => {
    await render(BoardColumn, { inputs: { title: 'To Do', status: 'todo', tasks: [] } });
    expect(screen.getByRole('region', { name: 'To Do column' })).toBeInTheDocument();
  });

  it('shows an empty-state message when there are no tasks', async () => {
    await render(BoardColumn, { inputs: { title: 'Done', status: 'done', tasks: [] } });
    expect(screen.getByText('No tasks here.')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('re-emits taskEdit/taskDelete with the originating task', async () => {
    const user = userEvent.setup();
    const task = makeTask({ id: '1', title: 'Design homepage' });
    const { fixture } = await render(BoardColumn, {
      inputs: { title: 'To Do', status: 'todo', tasks: [task] },
    });
    const edited: Task[] = [];
    fixture.componentInstance.taskEdit.subscribe((t) => edited.push(t));

    await user.click(screen.getByRole('button', { name: /more actions/i }));
    await user.click(await screen.findByRole('menuitem', { name: /edit/i }));

    expect(edited).toEqual([task]);
  });

  describe('drag and drop', () => {
    it('derives its drop-list id from the status input', async () => {
      const { fixture } = await render(BoardColumn, {
        inputs: { title: 'In Progress', status: 'in_progress', tasks: [] },
      });
      const list = (fixture.nativeElement as HTMLElement).querySelector('.board-column__list')!;
      expect(list.id).toBe('board-column-in_progress');
    });

    it('disables dragging for an optimistic (not-yet-confirmed) task', async () => {
      const task = makeTask({ id: 'optimistic-abc123' });
      const { fixture } = await render(BoardColumn, {
        inputs: { title: 'To Do', status: 'todo', tasks: [task] },
      });
      const card = (fixture.nativeElement as HTMLElement).querySelector('app-task-card')!;
      expect(card).toHaveClass('cdk-drag-disabled');
    });
  });
});
