import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import type { Task } from '../../../../core/models/task.model';
import { TaskCard } from './task-card';

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'task-1',
    title: 'Design homepage',
    description: 'Create wireframes and mockups',
    status: 'todo',
    priority: 'high',
    dueDate: '2026-09-10',
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

describe('TaskCard', () => {
  beforeEach(() => {
    // Fake only Date, not setTimeout/etc — Material's CDK Overlay (the menu
    // in the interaction tests below) needs real timers to actually open.
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-09-04T12:00:00.000Z'));
  });

  afterEach(() => vi.useRealTimers());

  it('renders title, description, tag, and assignee', async () => {
    await render(TaskCard, { inputs: { task: makeTask() } });
    expect(screen.getByText('Design homepage')).toBeInTheDocument();
    expect(screen.getByText('Create wireframes and mockups')).toBeInTheDocument();
    expect(screen.getByText('Design')).toBeInTheDocument();
    expect(screen.getByText('@Sarah')).toBeInTheDocument();
    expect(screen.getByText('SS')).toBeInTheDocument(); // avatar initials
  });

  it('renders every tag, not just the first', async () => {
    await render(TaskCard, {
      inputs: { task: makeTask({ tags: ['Design', 'Frontend', 'Urgent'] }) },
    });
    expect(screen.getByText('Design')).toBeInTheDocument();
    expect(screen.getByText('Frontend')).toBeInTheDocument();
    expect(screen.getByText('Urgent')).toBeInTheDocument();
  });

  it('renders no tag list when the task has no tags', async () => {
    const { fixture } = await render(TaskCard, { inputs: { task: makeTask({ tags: [] }) } });
    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector('.task-card__tags')).toBeNull();
  });

  it('applies a status-derived accent class for a task that is not overdue', async () => {
    const { fixture } = await render(TaskCard, {
      inputs: { task: makeTask({ status: 'in_progress', dueDate: '2026-09-20' }) },
    });
    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector('.task-card--in_progress')).not.toBeNull();
  });

  it('applies the overdue accent class regardless of status', async () => {
    const { fixture } = await render(TaskCard, {
      inputs: { task: makeTask({ status: 'in_progress', dueDate: '2026-09-01' }) },
    });
    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector('.task-card--overdue')).not.toBeNull();
    expect(host.querySelector('.task-card--in_progress')).toBeNull();
  });

  it("emits edit when the menu's Edit item is clicked", async () => {
    const user = userEvent.setup();
    const { fixture } = await render(TaskCard, { inputs: { task: makeTask() } });
    const emits: void[] = [];
    fixture.componentInstance.edit.subscribe(() => emits.push(undefined));

    await user.click(screen.getByRole('button', { name: /more actions/i }));
    await user.click(await screen.findByRole('menuitem', { name: /edit/i }));

    expect(emits).toHaveLength(1);
  });

  it("emits delete when the menu's Delete item is clicked", async () => {
    const user = userEvent.setup();
    const { fixture } = await render(TaskCard, { inputs: { task: makeTask() } });
    const emits: void[] = [];
    fixture.componentInstance.delete.subscribe(() => emits.push(undefined));

    await user.click(screen.getByRole('button', { name: /more actions/i }));
    await user.click(await screen.findByRole('menuitem', { name: /delete/i }));

    expect(emits).toHaveLength(1);
  });

  it('disables the actions menu for an optimistic (not-yet-confirmed) task', async () => {
    await render(TaskCard, { inputs: { task: makeTask({ id: 'optimistic-abc123' }) } });
    expect(screen.getByRole('button', { name: /more actions/i })).toBeDisabled();
  });

  it('falls back to "Unassigned" and a "?" avatar instead of crashing when assignee is missing', async () => {
    // Reproduces the real-world shape the mock backend used to echo back
    // before TaskStore started overlaying the resolved assignee — this is
    // the exact template access that used to throw
    // "Cannot read properties of undefined (reading 'avatar')" and take
    // down the whole render pass. Cast is deliberate: Task#assignee is
    // typed as required, but must never be trusted as actually present.
    const task = { ...makeTask(), assignee: undefined } as unknown as Task;
    await render(TaskCard, { inputs: { task } });

    expect(screen.getByText('@Unassigned')).toBeInTheDocument();
    expect(screen.getByText('?')).toBeInTheDocument();
  });

  it("opens and stays open when the actions menu is clicked (not swallowed by the card's drag handle)", async () => {
    // Regression test for the menu-open-then-instant-close glitch: cdkDrag's
    // own pointer tracking on the whole card host was racing the menu
    // overlay's open. Scoping the drag handle away from the actions row
    // (see task-card.html) fixed it — this asserts the menu is still open
    // well after the ~300ms window the original bug closed it within.
    const user = userEvent.setup();
    await render(TaskCard, { inputs: { task: makeTask() } });

    await user.click(screen.getByRole('button', { name: /more actions/i }));
    const menuItem = await screen.findByRole('menuitem', { name: /edit/i });
    expect(menuItem).toBeInTheDocument();

    // Real timers here (only Date is faked in this suite — see beforeEach),
    // so this is an actual elapsed wait, not a simulated tick.
    await new Promise((resolve) => setTimeout(resolve, 300));
    expect(screen.getByRole('menuitem', { name: /edit/i })).toBeInTheDocument();
  });

  describe('inline edit (double-click title/description)', () => {
    it('double-clicking the title swaps it for a focused, pre-filled input', async () => {
      const user = userEvent.setup();
      await render(TaskCard, { inputs: { task: makeTask() } });

      await user.dblClick(screen.getByText('Design homepage'));

      const input = screen.getByRole('textbox', { name: 'Title for Design homepage' });
      expect(input).toHaveValue('Design homepage');
      expect(input).toHaveFocus();
    });

    it('commits a renamed title on Enter and emits quickEdit with just the title', async () => {
      const user = userEvent.setup();
      const { fixture } = await render(TaskCard, { inputs: { task: makeTask() } });
      const emitted: unknown[] = [];
      fixture.componentInstance.quickEdit.subscribe((patch) => emitted.push(patch));

      await user.dblClick(screen.getByText('Design homepage'));
      const input = screen.getByRole('textbox', { name: 'Title for Design homepage' });
      await user.clear(input);
      await user.type(input, 'Design the new homepage{enter}');

      // Commits by emitting the patch upward, not by rewriting its own
      // `task` input — that's TaskStore's job once the PATCH round-trips
      // (see DashboardPage.onQuickEditTask). Here, with `task` untouched,
      // the card exits edit mode and simply displays the original title again.
      expect(emitted).toEqual([{ title: 'Design the new homepage' }]);
      expect(screen.queryByRole('textbox', { name: /title for/i })).not.toBeInTheDocument();
      expect(screen.getByText('Design homepage')).toBeInTheDocument();
    });

    it('commits on blur too, not just Enter', async () => {
      const user = userEvent.setup();
      const { fixture } = await render(TaskCard, { inputs: { task: makeTask() } });
      const emitted: unknown[] = [];
      fixture.componentInstance.quickEdit.subscribe((patch) => emitted.push(patch));

      await user.dblClick(screen.getByText('Design homepage'));
      const input = screen.getByRole('textbox', { name: 'Title for Design homepage' });
      await user.clear(input);
      await user.type(input, 'Renamed via blur');
      await user.tab(); // moves focus away -> blur

      expect(emitted).toEqual([{ title: 'Renamed via blur' }]);
    });

    it('cancels on Escape without emitting, reverting to the original title', async () => {
      const user = userEvent.setup();
      const { fixture } = await render(TaskCard, { inputs: { task: makeTask() } });
      const emitted: unknown[] = [];
      fixture.componentInstance.quickEdit.subscribe((patch) => emitted.push(patch));

      await user.dblClick(screen.getByText('Design homepage'));
      const input = screen.getByRole('textbox', { name: 'Title for Design homepage' });
      await user.clear(input);
      await user.type(input, 'This should not be saved{escape}');

      expect(emitted).toEqual([]);
      expect(screen.getByText('Design homepage')).toBeInTheDocument();
    });

    it('shows a validation error and keeps editing instead of emitting an invalid title', async () => {
      const user = userEvent.setup();
      const { fixture } = await render(TaskCard, { inputs: { task: makeTask() } });
      const emitted: unknown[] = [];
      fixture.componentInstance.quickEdit.subscribe((patch) => emitted.push(patch));

      await user.dblClick(screen.getByText('Design homepage'));
      const input = screen.getByRole('textbox', { name: 'Title for Design homepage' });
      await user.clear(input);
      await user.type(input, 'ab{enter}'); // under the 3-character minimum

      expect(screen.getByRole('alert')).toHaveTextContent('Title must be at least 3 characters.');
      expect(emitted).toEqual([]);
      expect(screen.getByRole('textbox', { name: /title for/i })).toBeInTheDocument(); // still editing
    });

    it('does not emit when the title is unchanged', async () => {
      const user = userEvent.setup();
      const { fixture } = await render(TaskCard, { inputs: { task: makeTask() } });
      const emitted: unknown[] = [];
      fixture.componentInstance.quickEdit.subscribe((patch) => emitted.push(patch));

      await user.dblClick(screen.getByText('Design homepage'));
      await user.keyboard('{enter}'); // commit with no changes made

      expect(emitted).toEqual([]);
    });

    it('does not enter edit mode for an optimistic (not-yet-confirmed) task', async () => {
      const user = userEvent.setup();
      await render(TaskCard, { inputs: { task: makeTask({ id: 'optimistic-abc123' }) } });

      await user.dblClick(screen.getByText('Design homepage'));

      expect(screen.queryByRole('textbox', { name: /title for/i })).not.toBeInTheDocument();
    });

    it('double-clicking the description commits on Ctrl+Enter, not plain Enter', async () => {
      const user = userEvent.setup();
      const { fixture } = await render(TaskCard, { inputs: { task: makeTask() } });
      const emitted: unknown[] = [];
      fixture.componentInstance.quickEdit.subscribe((patch) => emitted.push(patch));

      await user.dblClick(screen.getByText('Create wireframes and mockups'));
      const textarea = screen.getByRole('textbox', { name: 'Description for Design homepage' });
      await user.clear(textarea);
      await user.type(textarea, 'Line one{enter}Line two'); // plain Enter: newline, not commit

      expect(emitted).toEqual([]);
      expect(textarea).toHaveValue('Line one\nLine two');

      await user.type(textarea, '{control>}{enter}{/control}');
      expect(emitted).toEqual([{ description: 'Line one\nLine two' }]);
    });
  });
});
