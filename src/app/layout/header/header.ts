import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import type { Locale } from '../../core/i18n/translation.model';
import { TranslationService } from '../../core/i18n/translation.service';
import { Avatar } from '../../shared/ui/avatar/avatar';

/**
 * Global top bar: brand, search, notifications, language switcher,
 * current-user avatar. Mostly presentational, except the language
 * switcher — it talks to TranslationService directly instead of
 * round-tripping through Shell via an output. Unlike search (whose
 * debounce genuinely belongs to whoever owns that state), there's no
 * shared state here for a parent to own; TranslationService is already
 * the single source of truth, app-wide.
 */
@Component({
  selector: 'app-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, MatIconModule, MatMenuModule, TranslatePipe, Avatar],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  protected readonly i18n = inject(TranslationService);

  readonly currentUserInitials = input<string | null>(null);
  readonly notificationCount = input(0);

  readonly searchChange = output<string>();
  readonly notificationsClick = output<void>();
  /** Toggles the navigation drawer — the button is only visible below desktop width (see header.scss). */
  readonly menuClick = output<void>();

  readonly searchControl = new FormControl('', { nonNullable: true });

  constructor() {
    this.searchControl.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((value) => this.searchChange.emit(value));
  }

  protected setLocale(locale: Locale): void {
    this.i18n.setLocale(locale);
  }
}
