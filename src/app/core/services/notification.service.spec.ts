import { MatSnackBar } from '@angular/material/snack-bar';
import { TestBed } from '@angular/core/testing';
import { NotificationService } from './notification.service';

// A plain object, not an `expect.objectContaining()` matcher itself — this
// gets *spread into* each test's own objectContaining() below, so it needs
// real enumerable properties to spread, not a matcher's internal shape.
const BOTTOM_CENTER = {
  horizontalPosition: 'center',
  verticalPosition: 'bottom',
} as const;

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
      expect.objectContaining({
        duration: 6000,
        panelClass: 'app-snackbar-error',
        ...BOTTOM_CENTER,
      }),
    );
  });

  it('showSuccess() opens a self-dismissing snackbar with no action', () => {
    service.showSuccess('Task saved');

    expect(snackBarSpy.open).toHaveBeenCalledWith(
      'Task saved',
      undefined,
      expect.objectContaining({
        duration: 3000,
        panelClass: 'app-snackbar-success',
        ...BOTTOM_CENTER,
      }),
    );
  });

  it('showWarning() opens a self-dismissing snackbar with warning styling', () => {
    service.showWarning('Heads up');

    expect(snackBarSpy.open).toHaveBeenCalledWith(
      'Heads up',
      undefined,
      expect.objectContaining({
        duration: 4000,
        panelClass: 'app-snackbar-warning',
        ...BOTTOM_CENTER,
      }),
    );
  });

  it('showInfo() opens a self-dismissing snackbar with info styling', () => {
    service.showInfo('Coming soon');

    expect(snackBarSpy.open).toHaveBeenCalledWith(
      'Coming soon',
      undefined,
      expect.objectContaining({
        duration: 3000,
        panelClass: 'app-snackbar-info',
        ...BOTTOM_CENTER,
      }),
    );
  });

  it('every toast opens bottom-centre, not the Material default', () => {
    service.showSuccess('x');
    const [, , config] = snackBarSpy.open.mock.calls[0] as [
      unknown,
      unknown,
      Record<string, unknown>,
    ];
    expect(config['horizontalPosition']).toBe('center');
    expect(config['verticalPosition']).toBe('bottom');
  });
});
