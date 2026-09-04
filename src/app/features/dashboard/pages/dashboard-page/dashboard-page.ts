import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TaskStore } from '../../../../core/stores/task.store';
import { StatisticsStore } from '../../../../core/stores/statistics.store';
import { NotificationService } from '../../../../core/services/notification.service';
import { mergeLiveStatistics } from '../../../../core/utils/statistic.utils';
import type { TaskPriority, TaskStatus, Task } from '../../../../core/models/task.model';
import { ConfirmDialog } from '../../../../shared/ui/confirm-dialog/confirm-dialog';
import { StatCardsGrid } from '../../components/stat-cards-grid/stat-cards-grid';
import { TaskToolbar } from '../../components/task-toolbar/task-toolbar';
import { BoardColumn } from '../../components/board-column/board-column';

/**
 * The dashboard screen: stat cards, filter/search toolbar, and the 3-column
 * board. The only "smart" component in this feature — it injects the
 * stores and MatDialog, and every child below it is presentational.
 */
@Component({
  selector: 'app-dashboard-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [StatCardsGrid, TaskToolbar, BoardColumn],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.scss',
})
export class DashboardPage {
  protected readonly taskStore = inject(TaskStore);
  private readonly statisticsStore = inject(StatisticsStore);
  private readonly dialog = inject(MatDialog);
  private readonly notify = inject(NotificationService);

  protected readonly statistics = computed(() =>
    mergeLiveStatistics(this.statisticsStore.statistics(), this.taskStore.counts()),
  );

  protected onStatusChange(status: TaskStatus | 'all'): void {
    this.taskStore.setFilters({ status });
  }

  protected onPriorityChange(priority: TaskPriority | 'all'): void {
    this.taskStore.setFilters({ priority });
  }

  protected onNewTask(): void {
    // TODO(tasks feature): open the create-task form in a dialog.
    this.notify.showInfo('Creating tasks is landing in the next phase.');
  }

  protected onEditTask(task: Task): void {
    // TODO(tasks feature): open the edit-task form, pre-filled with `task`.
    this.notify.showInfo(`Editing "${task.title}" is landing in the next phase.`);
  }

  protected onDeleteTask(task: Task): void {
    const ref = this.dialog.open(ConfirmDialog, {
      data: {
        title: 'Delete task?',
        message: `Delete "${task.title}"? This can't be undone.`,
        confirmLabel: 'Delete',
        destructive: true,
      },
    });

    ref.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;
      this.taskStore.remove(task.id).catch(() => {
        // errorInterceptor already surfaced a snackbar for the failure.
      });
    });
  }
}
