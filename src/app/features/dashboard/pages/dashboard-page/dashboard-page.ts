import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TaskStore } from '../../../../core/stores/task.store';
import { StatisticsStore } from '../../../../core/stores/statistics.store';
import { mergeLiveStatistics } from '../../../../core/utils/statistic.utils';
import type { TaskPriority, TaskStatus, Task } from '../../../../core/models/task.model';
import { ConfirmDialog } from '../../../../shared/ui/confirm-dialog/confirm-dialog';
import { TaskDialogService } from '../../../tasks/task-dialog.service';
import { StatCardsGrid } from '../../components/stat-cards-grid/stat-cards-grid';
import { TaskToolbar } from '../../components/task-toolbar/task-toolbar';
import { BoardColumn } from '../../components/board-column/board-column';

/**
 * The dashboard screen: stat cards, filter/search toolbar, and the 3-column
 * board. The only "smart" component in this feature — it injects the
 * stores and MatDialog, and every child below it is presentational.
 *
 * Create/edit is delegated to `TaskDialogService`, which owns the full
 * open-dialog-then-persist flow — the same service the sidebar's "New Task"
 * button uses (see Shell), so every entry point behaves identically.
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
  private readonly taskDialog = inject(TaskDialogService);

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
    this.taskDialog.createTask();
  }

  protected onEditTask(task: Task): void {
    this.taskDialog.editTask(task);
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
