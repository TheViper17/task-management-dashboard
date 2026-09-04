import { BreakpointObserver } from '@angular/cdk/layout';
import { provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { of } from 'rxjs';
import { TaskStore } from '../../core/stores/task.store';
import { UserStore } from '../../core/stores/user.store';
import { TaskDialogService } from '../../features/tasks/task-dialog.service';
import { Shell } from './shell';

describe('Shell', () => {
  let setSearchSpy: ReturnType<typeof vi.fn>;
  let createTaskSpy: ReturnType<typeof vi.fn>;

  function setup(
    options: { users?: { avatar: string }[]; isHandset?: boolean } = {},
  ): ReturnType<typeof render<Shell>> {
    const { users = [{ avatar: 'JD' }], isHandset = false } = options;
    setSearchSpy = vi.fn();
    createTaskSpy = vi.fn();
    return render(Shell, {
      providers: [
        provideRouter([]),
        { provide: TaskStore, useValue: { setSearch: setSearchSpy } },
        { provide: UserStore, useValue: { users: () => users } },
        { provide: TaskDialogService, useValue: { createTask: createTaskSpy } },
        // jsdom has no window.matchMedia, which BreakpointObserver needs —
        // stub it rather than let a real API call fail in tests.
        { provide: BreakpointObserver, useValue: { observe: () => of({ matches: isHandset }) } },
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
    await setup({ users: [{ avatar: 'JD' }] });
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('renders no avatar when there is no current user', async () => {
    await setup({ users: [] });
    expect(screen.queryByText('JD')).not.toBeInTheDocument();
  });

  it('delegates the sidebar\'s "New Task" button to TaskDialogService.createTask()', async () => {
    const user = userEvent.setup();
    await setup();

    await user.click(screen.getByRole('button', { name: /new task/i }));

    expect(createTaskSpy).toHaveBeenCalled();
  });

  it('includes a skip-to-content link targeting the main region', async () => {
    await setup();
    const link = screen.getByText('Skip to main content');
    expect(link).toHaveAttribute('href', '#main-content');
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

  describe('responsive drawer', () => {
    it('toggles the drawer when the header requests it, on handset', async () => {
      // The header menu button's own visibility is a real CSS media query
      // matched against the actual viewport (verified separately in a real
      // browser — jsdom doesn't evaluate media queries the same way, so
      // querying for the button here would test jsdom's CSS engine, not our
      // code). This calls the same method the button's (click) is bound to,
      // to test the actual toggle behaviour the wiring exists for.
      const { fixture } = await setup({ isHandset: true });

      // The drawer starts closed on handset ([opened]="!isHandset()").
      fixture.componentInstance.onMenuToggle();

      expect(await screen.findByText('Dashboard')).toBeVisible();
    });
  });
});
