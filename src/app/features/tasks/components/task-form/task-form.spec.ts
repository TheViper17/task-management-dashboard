import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import type { Assignee, CreateTaskDto, Task } from '../../../../core/models/task.model';
import { TaskForm } from './task-form';

const ASSIGNEES: Assignee[] = [
  { id: 'user-1', name: 'Ada Lovelace', avatar: 'AL', email: 'ada@company.com' },
  { id: 'user-2', name: 'Grace Hopper', avatar: 'GH', email: 'grace@company.com' },
];

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'task-1',
    title: 'Design homepage',
    description: 'Create wireframes and mockups',
    status: 'in_progress',
    priority: 'high',
    dueDate: '2026-08-01',
    isOverdue: true,
    assignee: ASSIGNEES[0],
    assigneeId: 'user-1',
    tags: ['Design', 'Frontend'],
    order: 0,
    createdAt: '2026-07-01T00:00:00.000Z',
    updatedAt: '2026-07-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('TaskForm', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-09-04T12:00:00.000Z'));
  });

  afterEach(() => vi.useRealTimers());

  describe('create mode', () => {
    it('defaults status to "todo" and priority to "medium"', async () => {
      const { fixture } = await render(TaskForm, { inputs: { assignees: ASSIGNEES } });
      const component = fixture.componentInstance as unknown as { form: { value: unknown } };
      expect(component.form.value).toEqual(
        expect.objectContaining({ status: 'todo', priority: 'medium' }),
      );
    });

    it('shows required errors only after the field is touched', async () => {
      const user = userEvent.setup();
      await render(TaskForm, { inputs: { assignees: ASSIGNEES } });

      expect(screen.queryByText('Title is required.')).not.toBeInTheDocument();

      const title = screen.getByLabelText('Title');
      await user.click(title);
      await user.tab();

      expect(screen.getByText('Title is required.')).toBeInTheDocument();
    });

    it('rejects a past due date', async () => {
      const user = userEvent.setup();
      await render(TaskForm, { inputs: { assignees: ASSIGNEES } });

      await user.type(screen.getByLabelText('Due date'), '2026-09-01');
      await user.tab();

      expect(screen.getByText("Due date can't be in the past.")).toBeInTheDocument();
    });

    it('opens a calendar to pick the due date, instead of typing only', async () => {
      const user = userEvent.setup();
      const { fixture } = await render(TaskForm, { inputs: { assignees: ASSIGNEES } });

      await user.click(screen.getByRole('button', { name: /open calendar/i }));
      // The 20th of the currently-open month (September 2026, per the fixed clock).
      await user.click(await screen.findByRole('button', { name: 'September 20, 2026' }));

      // Asserted on the reactive form's own value, not the input's rendered
      // text — the overlay's close animation isn't synchronous, and the
      // calendar dialog is itself aria-labelledby "Due date" while it's
      // still around, which makes DOM-text assertions racy here.
      const component = fixture.componentInstance as unknown as {
        form: { controls: { dueDate: { value: Date | null } } };
      };
      expect(component.form.controls.dueDate.value).toEqual(new Date(2026, 8, 20));
    });

    it('does not submit while invalid, and marks fields touched instead', async () => {
      const user = userEvent.setup();
      const { fixture } = await render(TaskForm, { inputs: { assignees: ASSIGNEES } });
      const saved: CreateTaskDto[] = [];
      fixture.componentInstance.save.subscribe((dto: CreateTaskDto) => saved.push(dto));

      await user.click(screen.getByRole('button', { name: 'Create Task' }));

      expect(saved).toHaveLength(0);
      expect(screen.getByText('Title is required.')).toBeInTheDocument();
    });

    it('emits save with a valid DTO on submit', async () => {
      const user = userEvent.setup();
      const { fixture } = await render(TaskForm, { inputs: { assignees: ASSIGNEES } });
      const saved: CreateTaskDto[] = [];
      fixture.componentInstance.save.subscribe((dto: CreateTaskDto) => saved.push(dto));

      await user.type(screen.getByLabelText('Title'), 'Write onboarding docs');
      await user.type(
        screen.getByLabelText('Description'),
        'Document the new employee onboarding flow',
      );
      await user.type(screen.getByLabelText('Due date'), '2026-09-20');

      await user.click(screen.getByRole('combobox', { name: 'Assignee' }));
      await user.click(await screen.findByRole('option', { name: 'Ada Lovelace' }));

      await user.click(screen.getByRole('button', { name: 'Create Task' }));

      expect(saved).toEqual([
        {
          title: 'Write onboarding docs',
          description: 'Document the new employee onboarding flow',
          status: 'todo',
          priority: 'medium',
          dueDate: '2026-09-20',
          assigneeId: 'user-1',
          tags: [],
        },
      ]);
    });

    it('emits cancelled when Cancel is clicked', async () => {
      const user = userEvent.setup();
      const { fixture } = await render(TaskForm, { inputs: { assignees: ASSIGNEES } });
      const cancels: void[] = [];
      fixture.componentInstance.cancelled.subscribe(() => cancels.push(undefined));

      await user.click(screen.getByRole('button', { name: 'Cancel' }));

      expect(cancels).toHaveLength(1);
    });
  });

  describe('tags (dynamic FormArray)', () => {
    it('adds a tag on clicking Add, and clears the input', async () => {
      const user = userEvent.setup();
      await render(TaskForm, { inputs: { assignees: ASSIGNEES } });

      const tagInput = screen.getByLabelText('Add a tag');
      await user.type(tagInput, 'Urgent');
      await user.click(screen.getByRole('button', { name: 'Add' }));

      expect(screen.getByText('Urgent')).toBeInTheDocument();
      expect(tagInput).toHaveValue('');
    });

    it('adds a tag on pressing Enter', async () => {
      const user = userEvent.setup();
      await render(TaskForm, { inputs: { assignees: ASSIGNEES } });

      await user.type(screen.getByLabelText('Add a tag'), 'Backend{enter}');

      expect(screen.getByText('Backend')).toBeInTheDocument();
    });

    it('ignores a blank tag', async () => {
      const user = userEvent.setup();
      await render(TaskForm, { inputs: { assignees: ASSIGNEES } });

      await user.type(screen.getByLabelText('Add a tag'), '   {enter}');

      expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
    });

    it('removes a tag when its remove button is clicked', async () => {
      const user = userEvent.setup();
      await render(TaskForm, { inputs: { assignees: ASSIGNEES } });

      await user.type(screen.getByLabelText('Add a tag'), 'Urgent{enter}');
      await user.click(screen.getByRole('button', { name: 'Remove tag Urgent' }));

      expect(screen.queryByText('Urgent')).not.toBeInTheDocument();
    });

    it('disables Add once 5 tags are reached', async () => {
      const user = userEvent.setup();
      await render(TaskForm, { inputs: { assignees: ASSIGNEES } });

      for (const tag of ['a', 'b', 'c', 'd', 'e']) {
        await user.type(screen.getByLabelText('Add a tag'), `${tag}{enter}`);
      }

      expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled();
    });
  });

  describe('edit mode', () => {
    it('pre-fills every field from the given task', async () => {
      await render(TaskForm, { inputs: { task: makeTask(), assignees: ASSIGNEES } });

      expect(screen.getByLabelText('Title')).toHaveValue('Design homepage');
      expect(screen.getByLabelText('Description')).toHaveValue('Create wireframes and mockups');
      // Displayed via the datepicker's own format (MAT_DATE_LOCALE 'en-US'),
      // not the "YYYY-MM-DD" wire format task.dueDate is stored as.
      expect(screen.getByLabelText('Due date')).toHaveValue('8/1/2026');
      expect(screen.getByText('Design')).toBeInTheDocument();
      expect(screen.getByText('Frontend')).toBeInTheDocument();
    });

    it('labels the submit button "Save Changes"', async () => {
      await render(TaskForm, { inputs: { task: makeTask(), assignees: ASSIGNEES } });
      expect(screen.getByRole('button', { name: 'Save Changes' })).toBeInTheDocument();
    });

    it("does not reject the task's own already-past due date", async () => {
      const user = userEvent.setup();
      await render(TaskForm, { inputs: { task: makeTask(), assignees: ASSIGNEES } });

      await user.click(screen.getByLabelText('Due date'));
      await user.tab();

      expect(screen.queryByText("Due date can't be in the past.")).not.toBeInTheDocument();
    });
  });
});
