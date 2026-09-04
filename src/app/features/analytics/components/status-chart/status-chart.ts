import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import type { ChartConfiguration } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { TranslationService } from '../../../../core/i18n/translation.service';
import type { TranslationKey } from '../../../../core/i18n/translations/en';
import type { TaskStatus } from '../../../../core/models/task.model';

const LABEL_KEYS: Record<TaskStatus, TranslationKey> = {
  todo: 'status.todo',
  in_progress: 'status.inProgress',
  done: 'status.done',
};
// Matches --app-status-todo/in-progress/done in _tokens.scss — duplicated
// as literal hex because a <canvas> can't read CSS custom properties.
const COLORS: Record<TaskStatus, string> = {
  todo: '#1976d2',
  in_progress: '#b45202',
  done: '#2e7d32',
};

/** Bar chart of task counts by status. See PriorityChart's doc comment for the sr-only and locale rationale. */
@Component({
  selector: 'app-status-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BaseChartDirective],
  templateUrl: './status-chart.html',
  styleUrl: './status-chart.scss',
})
export class StatusChart {
  private readonly i18n = inject(TranslationService);

  readonly data = input.required<Record<TaskStatus, number>>();

  protected readonly statuses: readonly TaskStatus[] = ['todo', 'in_progress', 'done'];

  protected readonly chartData = computed<ChartConfiguration<'bar'>['data']>(() => {
    const data = this.data();
    return {
      labels: this.statuses.map((s) => this.i18n.translate(LABEL_KEYS[s])),
      datasets: [
        {
          data: this.statuses.map((s) => data[s]),
          backgroundColor: this.statuses.map((s) => COLORS[s]),
          borderRadius: 4,
          maxBarThickness: 48,
        },
      ],
    };
  });

  protected readonly chartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
  };

  protected label(status: TaskStatus): string {
    return this.i18n.translate(LABEL_KEYS[status]);
  }

  protected srItem(status: TaskStatus): string {
    return this.i18n.translate('analytics.chartSrItem', {
      label: this.label(status),
      count: this.data()[status],
    });
  }
}
