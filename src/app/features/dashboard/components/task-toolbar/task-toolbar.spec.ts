import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { TaskToolbar } from './task-toolbar';

describe('TaskToolbar', () => {
  it('emits statusChange when a status tab is clicked', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(TaskToolbar, { inputs: { activeStatus: 'all' } });
    const emitted: string[] = [];
    fixture.componentInstance.statusChange.subscribe((v) => emitted.push(v));

    await user.click(screen.getByText('To Do'));

    expect(emitted).toEqual(['todo']);
  });

  it('shows "Priority" as the dropdown label when no priority filter is active', async () => {
    await render(TaskToolbar, { inputs: { activePriority: 'all' } });
    expect(screen.getByRole('button', { name: /priority/i })).toBeInTheDocument();
  });

  it('shows the selected priority as the dropdown label', async () => {
    await render(TaskToolbar, { inputs: { activePriority: 'high' } });
    expect(screen.getByRole('button', { name: /high/i })).toBeInTheDocument();
  });

  it('emits priorityChange when a priority menu item is chosen', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(TaskToolbar);
    const emitted: string[] = [];
    fixture.componentInstance.priorityChange.subscribe((v) => emitted.push(v));

    await user.click(screen.getByRole('button', { name: /priority/i }));
    await user.click(await screen.findByRole('menuitem', { name: 'High' }));

    expect(emitted).toEqual(['high']);
  });

  it('emits newTaskClick when the "New Task" button is clicked', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(TaskToolbar);
    const clicks: void[] = [];
    fixture.componentInstance.newTaskClick.subscribe(() => clicks.push(undefined));

    await user.click(screen.getByRole('button', { name: /new task/i }));

    expect(clicks).toHaveLength(1);
  });
});
