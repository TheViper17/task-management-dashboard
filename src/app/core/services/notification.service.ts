import { Injectable, inject } from '@angular/core';
import type { MatSnackBarConfig } from '@angular/material/snack-bar';
import { MatSnackBar } from '@angular/material/snack-bar';

/**
 * Wraps MatSnackBar behind a plain showError/showSuccess/showWarning/
 * showInfo API, so the rest of the app doesn't depend on Material's
 * snackbar directly — swapping the toast library later only touches this
 * file. Positioning and colour come from the global snackbar styles,
 * loaded separately since a snackbar renders outside any component's own
 * view.
 */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly snackBar = inject(MatSnackBar);

  showError(message: string): void {
    this.open(message, 'Dismiss', 6000, 'app-snackbar-error');
  }

  showSuccess(message: string): void {
    this.open(message, undefined, 3000, 'app-snackbar-success');
  }

  showWarning(message: string): void {
    this.open(message, undefined, 4000, 'app-snackbar-warning');
  }

  showInfo(message: string): void {
    this.open(message, undefined, 3000, 'app-snackbar-info');
  }

  private open(
    message: string,
    action: string | undefined,
    duration: number,
    panelClass: string,
  ): void {
    const config: MatSnackBarConfig = {
      duration,
      panelClass,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    };
    this.snackBar.open(message, action, config);
  }
}
