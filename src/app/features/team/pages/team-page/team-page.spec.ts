import { render, screen } from '@testing-library/angular';
import type { Assignee, Task } from '../../../../core/models/task.model';
import { TaskStore } from '../../../../core/stores/task.store';
import { UserStore } from '../../../../core/stores/user.store';
import { TeamPage } from './team-page';

const USERS: Assignee[] = [
  { id: 'user-1', name: 'Ada Lovelace', avatar: 'AL', email: 'ada@company.com' },
  { id: 'user-2', name: 'Grace Hopper', avatar: 'GH', email: 'grace@company.com' },
];

function makeTask(assigneeId: string): Task {
  return {
    id: `task-${assigneeId}-${Math.random()}`,
    title: 't',
    description: 'd',
    status: 'todo',
    priority: 'low',
    dueDate: '2026-09-10',
    isOverdue: false,
    assignee: USERS[0],
    assigneeId,
    tags: [],
    order: 0,
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
  };
}

describe('TeamPage', () => {
  async function setup(
    options: { isLoading?: boolean; users?: Assignee[] } = {},
  ): Promise<unknown> {
    const { isLoading = false, users = USERS } = options;
    return render(TeamPage, {
      providers: [
        { provide: UserStore, useValue: { users: () => users, isLoading: () => isLoading } },
        {
          provide: TaskStore,
          useValue: { tasks: () => [makeTask('user-1'), makeTask('user-1'), makeTask('user-2')] },
        },
      ],
    });
  }

  it('renders a card per user with the correct assigned-task count', async () => {
    await setup();
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
    expect(screen.getByText('2 tasks')).toBeInTheDocument();
    expect(screen.getByText('Grace Hopper')).toBeInTheDocument();
    expect(screen.getByText('1 task')).toBeInTheDocument();
  });

  it('shows a loading status while there are no users yet', async () => {
    await setup({ isLoading: true, users: [] });
    expect(screen.getByRole('status')).toHaveTextContent(/loading team/i);
  });

  it('shows an empty state once loaded with no users', async () => {
    await setup({ isLoading: false, users: [] });
    expect(screen.getByText('No team members yet.')).toBeInTheDocument();
  });
});
