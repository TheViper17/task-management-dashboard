import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { NAV_ITEMS } from './nav-items';

/** Left navigation rail: route links plus the "+ New Task" shortcut. */
@Component({
  selector: 'app-sidebar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, MatIconModule, TranslatePipe],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  readonly navItems = NAV_ITEMS;
  readonly newTaskClick = output<void>();
  /** Fired on any nav-item click — Shell uses this to close the drawer on handset. */
  readonly linkClick = output<void>();
}
