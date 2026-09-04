import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import type { Statistic } from '../../../../core/models/statistic.model';

/**
 * One dashboard stat card (Total Tasks / Completed / In Progress / Overdue).
 * The delta line reads "{change} {changeLabel}" (e.g. "+12 this week"),
 * except when `change` is the literal "0" — then only the label is shown
 * ("Same as yesterday"), matching the Figma "In Progress" card exactly.
 */
@Component({
  selector: 'app-stat-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './stat-card.html',
  styleUrl: './stat-card.scss',
})
export class StatCard {
  readonly statistic = input.required<Statistic>();

  protected readonly deltaText = computed(() => {
    const stat = this.statistic();
    return stat.change === '0' ? stat.changeLabel : `${stat.change} ${stat.changeLabel}`;
  });
}
