import { provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { TaskStore } from '../../core/stores/task.store';
import { UserStore } from '../../core/stores/user.store';
import { TaskDialogService } from '../../features/tasks/task-dialog.service';
import { Shell } from './shell';

describe('Shell', () => {
  let setSearchSpy: ReturnType<typeof vi.fn>;
  let createTaskSpy: ReturnType<typeof vi.fn>;

  async function setup(users: { avatar: string }[] = [{ avatar: 'JD' }]): Promise<unknown> {
    setSearchSpy = vi.fn();
    createTaskSpy = vi.fn();
    return render(Shell, {
      providers: [
        provideRouter([]),
        { provide: TaskStore, useValue: { setSearch: setSearchSpy } },
        { provide: UserStore, useValue: { users: () => users } },
        { provide: TaskDialogService, useValue: { createTask: createTaskSpy } },
      ],
    });
  }

  afterEach(() => vi.useRealTimers());

  it('renders the header brand and every sidebar nav item', async () => {
    await setup();
    expect(screen.getByText('Task Manager')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it("shows the current user's initials in the header avatar", async () => {
    await setup([{ avatar: 'JD' }]);
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('renders no avatar when there is no current user', async () => {
    await setup([]);
    expect(screen.queryByText('JD')).not.toBeInTheDocument();
  });

  it('delegates the sidebar\'s "New Task" button to TaskDialogService.createTask()', async () => {
    const user = userEvent.setup();
    await setup();

    await user.click(screen.getByRole('button', { name: /new task/i }));

    expect(createTaskSpy).toHaveBeenCalled();
  });

  it('debounces search input before calling TaskStore.setSearch', async () => {
    vi.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    await setup();

    await user.type(screen.getByRole('searchbox'), 'design');
    expect(setSearchSpy).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(300);
    expect(setSearchSpy).toHaveBeenCalledWith('design');
  });

  it('does not re-call setSearch when the debounced value is unchanged', async () => {
    vi.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    await setup();

    await user.type(screen.getByRole('searchbox'), 'x');
    await vi.advanceTimersByTimeAsync(300);
    await user.clear(screen.getByRole('searchbox'));
    await user.type(screen.getByRole('searchbox'), 'x');
    await vi.advanceTimersByTimeAsync(300);

    expect(setSearchSpy).toHaveBeenCalledTimes(1);
  });
});
