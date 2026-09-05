import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import type { ChartConfiguration } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { TranslationService } from '../../../../core/i18n/translation.service';
import type { TranslationKey } from '../../../../core/i18n/translations/en';
import type { TaskPriority } from '../../../../core/models/task.model';

const LABEL_KEYS: Record<TaskPriority, TranslationKey> = {
  high: 'priority.high',
  medium: 'priority.medium',
  low: 'priority.low',
};
// Matches --app-priority-high/medium/low in _tokens.scss. Chart.js draws
// to canvas and can't read CSS custom properties, so these are the same
// hex values, duplicated on purpose — see the class comment.
const COLORS: Record<TaskPriority, string> = {
  high: '#cb2d2d',
  medium: '#b45202',
  low: '#2e7d32',
};

/**
 * Doughnut chart of task counts by priority. Chart.js draws to a canvas,
 * which can't pick up CSS custom properties (colours are duplicated as
 * literal hex below) and is invisible to screen readers — the template
 * also renders an .sr-only list with the same numbers as real text.
 */
@Component({
  selector: 'app-priority-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BaseChartDirective],
  templateUrl: './priority-chart.html',
  styleUrl: './priority-chart.scss',
})
export class PriorityChart {
  private readonly i18n = inject(TranslationService);

  readonly data = input.required<Record<TaskPriority, number>>();

  protected readonly priorities: readonly TaskPriority[] = ['high', 'medium', 'low'];

  // Reads this.i18n.translate(...) inside this computed, not just
  // this.data() — that's what makes it (and Chart.js's canvas) re-render
  // when the language switches, not just when the counts change.
  protected readonly chartData = computed<ChartConfiguration<'doughnut'>['data']>(() => {
    const data = this.data();
    return {
      labels: this.priorities.map((p) => this.i18n.translate(LABEL_KEYS[p])),
      datasets: [
        {
          data: this.priorities.map((p) => data[p]),
          backgroundColor: this.priorities.map((p) => COLORS[p]),
          borderWidth: 0,
        },
      ],
    };
  });

  protected readonly chartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { boxWidth: 12, padding: 16 } },
    },
  };

  protected label(priority: TaskPriority): string {
    return this.i18n.translate(LABEL_KEYS[priority]);
  }

  protected srItem(priority: TaskPriority): string {
    return this.i18n.translate('analytics.chartSrItem', {
      label: this.label(priority),
      count: this.data()[priority],
    });
  }
}
