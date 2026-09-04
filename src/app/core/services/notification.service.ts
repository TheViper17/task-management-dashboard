import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

/**
 * Thin wrapper around `MatSnackBar` so the rest of the app depends on an
 * intent-revealing API (`showError` / `showSuccess`) instead of Material's
 * snackbar directly — swapping the toast implementation later touches one file.
 */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly snackBar = inject(MatSnackBar);

  showError(message: string): void {
    this.snackBar.open(message, 'Dismiss', { duration: 6000, panelClass: 'app-snackbar-error' });
  }

  showSuccess(message: string): void {
    this.snackBar.open(message, undefined, { duration: 3000, panelClass: 'app-snackbar-success' });
  }
}
