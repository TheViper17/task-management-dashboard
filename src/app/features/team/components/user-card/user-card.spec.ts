import { render, screen } from '@testing-library/angular';
import type { Assignee } from '../../../../core/models/task.model';
import { UserCard } from './user-card';

const USER: Assignee = {
  id: 'user-1',
  name: 'Ada Lovelace',
  avatar: 'AL',
  email: 'ada@company.com',
};

describe('UserCard', () => {
  it('renders the name, email, and initials', async () => {
    await render(UserCard, { inputs: { user: USER } });
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
    expect(screen.getByText('ada@company.com')).toBeInTheDocument();
    expect(screen.getByText('AL')).toBeInTheDocument();
  });

  it('pluralises the task count correctly', async () => {
    const { rerender } = await render(UserCard, { inputs: { user: USER, taskCount: 1 } });
    expect(screen.getByText('1 task')).toBeInTheDocument();

    await rerender({ inputs: { user: USER, taskCount: 3 } });
    expect(screen.getByText('3 tasks')).toBeInTheDocument();
  });

  it('defaults the task count to 0', async () => {
    await render(UserCard, { inputs: { user: USER } });
    expect(screen.getByText('0 tasks')).toBeInTheDocument();
  });
});
