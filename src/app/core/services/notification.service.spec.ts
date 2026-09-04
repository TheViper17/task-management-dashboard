import { MatSnackBar } from '@angular/material/snack-bar';
import { TestBed } from '@angular/core/testing';
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;
  let snackBarSpy: { open: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    snackBarSpy = { open: vi.fn() };
    TestBed.configureTestingModule({
      providers: [{ provide: MatSnackBar, useValue: snackBarSpy }],
    });
    service = TestBed.inject(NotificationService);
  });

  it('showError() opens a snackbar with a Dismiss action and error styling', () => {
    service.showError('Something broke');

    expect(snackBarSpy.open).toHaveBeenCalledWith(
      'Something broke',
      'Dismiss',
      expect.objectContaining({ duration: 6000, panelClass: 'app-snackbar-error' }),
    );
  });

  it('showSuccess() opens a self-dismissing snackbar with no action', () => {
    service.showSuccess('Task saved');

    expect(snackBarSpy.open).toHaveBeenCalledWith(
      'Task saved',
      undefined,
      expect.objectContaining({ duration: 3000, panelClass: 'app-snackbar-success' }),
    );
  });
});
