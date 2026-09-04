import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { ConfirmDialog } from './confirm-dialog';
import type { ConfirmDialogData } from './confirm-dialog';

describe('ConfirmDialog', () => {
  let closeSpy: ReturnType<typeof vi.fn>;

  async function setup(
    data: ConfirmDialogData = { title: 'Delete task?', message: 'Are you sure?' },
  ): Promise<unknown> {
    closeSpy = vi.fn();
    return render(ConfirmDialog, {
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: MatDialogRef, useValue: { close: closeSpy } },
      ],
    });
  }

  it('renders the title and message', async () => {
    await setup();
    expect(screen.getByText('Delete task?')).toBeInTheDocument();
    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
  });

  it('uses default labels when none are provided', async () => {
    await setup();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
  });

  it('uses custom labels when provided', async () => {
    await setup({ title: 't', message: 'm', confirmLabel: 'Delete', cancelLabel: 'Keep it' });
    expect(screen.getByRole('button', { name: 'Keep it' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
  });

  it('closes with true when confirmed', async () => {
    const user = userEvent.setup();
    await setup();
    await user.click(screen.getByRole('button', { name: 'Confirm' }));
    expect(closeSpy).toHaveBeenCalledWith(true);
  });

  it('closes with false when cancelled', async () => {
    const user = userEvent.setup();
    await setup();
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(closeSpy).toHaveBeenCalledWith(false);
  });
});
