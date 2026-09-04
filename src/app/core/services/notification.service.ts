import { Injectable, inject } from '@angular/core';
import type { MatSnackBarConfig } from '@angular/material/snack-bar';
import { MatSnackBar } from '@angular/material/snack-bar';

/**
 * Thin wrapper around `MatSnackBar` so the rest of the app depends on an
 * intent-revealing API (`showError` / `showSuccess` / `showWarning` /
 * `showInfo`) instead of Material's snackbar directly — swapping the toast
 * implementation later touches one file. Every toast opens bottom-centre
 * and is colour-coded by severity (see notification.service.scss, loaded
 * globally since a snackbar's overlay renders outside any component's view
 * encapsulation).
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
