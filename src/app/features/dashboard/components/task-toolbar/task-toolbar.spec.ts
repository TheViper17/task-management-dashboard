import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import type { Assignee } from '../../../../core/models/task.model';
import { TaskToolbar } from './task-toolbar';

const ASSIGNEES: Assignee[] = [
  { id: 'user-1', name: 'Ada Lovelace', avatar: 'AL', email: 'ada@company.com' },
  { id: 'user-2', name: 'Grace Hopper', avatar: 'GH', email: 'grace@company.com' },
];

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

  it('shows "Assignee" as the dropdown label when no assignee filter is active', async () => {
    await render(TaskToolbar, { inputs: { activeAssigneeId: 'all', assignees: ASSIGNEES } });
    expect(screen.getByRole('button', { name: /assignee/i })).toBeInTheDocument();
  });

  it("shows the selected assignee's name as the dropdown label", async () => {
    await render(TaskToolbar, { inputs: { activeAssigneeId: 'user-1', assignees: ASSIGNEES } });
    expect(screen.getByRole('button', { name: 'Ada Lovelace' })).toBeInTheDocument();
  });

  it('lists every assignee in the menu and emits assigneeChange when one is chosen', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(TaskToolbar, { inputs: { assignees: ASSIGNEES } });
    const emitted: string[] = [];
    fixture.componentInstance.assigneeChange.subscribe((v) => emitted.push(v));

    await user.click(screen.getByRole('button', { name: /assignee/i }));
    expect(await screen.findByRole('menuitem', { name: 'Grace Hopper' })).toBeInTheDocument();
    await user.click(screen.getByRole('menuitem', { name: 'Ada Lovelace' }));

    expect(emitted).toEqual(['user-1']);
  });

  it('emits assigneeChange with the "all" sentinel when "All Assignees" is chosen', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(TaskToolbar, {
      inputs: { activeAssigneeId: 'user-1', assignees: ASSIGNEES },
    });
    const emitted: string[] = [];
    fixture.componentInstance.assigneeChange.subscribe((v) => emitted.push(v));

    await user.click(screen.getByRole('button', { name: 'Ada Lovelace' }));
    await user.click(await screen.findByRole('menuitem', { name: 'All Assignees' }));

    expect(emitted).toEqual(['all']);
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
