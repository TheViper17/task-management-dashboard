import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { TranslatePipe } from '../../../../core/i18n/translate.pipe';
import { ActivityStore } from '../../../../core/stores/activity.store';
import { TaskStore } from '../../../../core/stores/task.store';
import { ActivityFeed } from '../../components/activity-feed/activity-feed';
import { PriorityChart } from '../../components/priority-chart/priority-chart';
import { StatusChart } from '../../components/status-chart/status-chart';

/**
 * Charts (priority/status distribution) + recent activity.
 *
 * `provideCharts` is registered here — on the page itself, not in
 * `app.config.ts` — specifically so Chart.js stays out of the eager bundle
 * and only downloads inside this lazy chunk, when someone actually visits
 * `/analytics`. `PriorityChart`/`StatusChart` resolve it from this
 * component's injector via normal DI (they're both descendants of it).
 */
@Component({
  selector: 'app-analytics-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PriorityChart, StatusChart, ActivityFeed, TranslatePipe],
  providers: [provideCharts(withDefaultRegisterables())],
  templateUrl: './analytics-page.html',
  styleUrl: './analytics-page.scss',
})
export class AnalyticsPage {
  protected readonly taskStore = inject(TaskStore);
  protected readonly activityStore = inject(ActivityStore);
}
