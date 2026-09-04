import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { Statistic } from '../../../../core/models/statistic.model';
import { StatCard } from '../stat-card/stat-card';

/** Responsive grid of stat cards: 4-up desktop, 2-up tablet, 1-up mobile. */
@Component({
  selector: 'app-stat-cards-grid',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [StatCard],
  templateUrl: './stat-cards-grid.html',
  styleUrl: './stat-cards-grid.scss',
})
export class StatCardsGrid {
  readonly statistics = input.required<readonly Statistic[]>();
}
