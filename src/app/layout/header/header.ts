import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Avatar } from '../../shared/ui/avatar/avatar';

/**
 * Global top bar: brand, search, notifications, current-user avatar.
 * Purely presentational — emits the raw search value on every keystroke
 * and leaves debouncing to whoever owns the search state (`Shell`), so
 * this component stays a simple, fast-to-test function of its inputs.
 */
@Component({
  selector: 'app-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, MatIconModule, Avatar],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  readonly currentUserInitials = input<string | null>(null);
  readonly notificationCount = input(0);

  readonly searchChange = output<string>();
  readonly notificationsClick = output<void>();

  readonly searchControl = new FormControl('', { nonNullable: true });

  constructor() {
    this.searchControl.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((value) => this.searchChange.emit(value));
  }
}
