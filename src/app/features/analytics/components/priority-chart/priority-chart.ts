import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import type { ChartConfiguration } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import type { TaskPriority } from '../../../../core/models/task.model';

const LABELS: Record<TaskPriority, string> = { high: 'High', medium: 'Medium', low: 'Low' };
// Matches --app-priority-high/medium/low in _tokens.scss. Chart.js canvas
// rendering can't read CSS custom properties, so these are the same hex
// values duplicated intentionally — see the class doc comment.
const COLORS: Record<TaskPriority, string> = {
  high: '#cb2d2d',
  medium: '#b45202',
  low: '#2e7d32',
};

/**
 * Doughnut chart of task counts by priority. Chart.js draws to a `<canvas>`,
 * which can't pick up our CSS custom properties (colours are duplicated as
 * literal hex below) and is invisible to screen readers — the template also
 * renders an `.sr-only` list with the same numbers as real, readable text.
 */
@Component({
  selector: 'app-priority-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BaseChartDirective],
  templateUrl: './priority-chart.html',
  styleUrl: './priority-chart.scss',
})
export class PriorityChart {
  readonly data = input.required<Record<TaskPriority, number>>();

  protected readonly priorities: readonly TaskPriority[] = ['high', 'medium', 'low'];

  protected readonly chartData = computed<ChartConfiguration<'doughnut'>['data']>(() => {
    const data = this.data();
    return {
      labels: this.priorities.map((p) => LABELS[p]),
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
    return LABELS[priority];
  }
}
