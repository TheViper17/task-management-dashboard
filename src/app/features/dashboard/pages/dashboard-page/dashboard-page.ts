import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import type { CdkDragDrop } from '@angular/cdk/drag-drop';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { TaskStore } from '../../../../core/stores/task.store';
import { StatisticsStore } from '../../../../core/stores/statistics.store';
import { UserStore } from '../../../../core/stores/user.store';
import { mergeLiveStatistics } from '../../../../core/utils/statistic.utils';
import type { TaskPatch, TaskPriority, TaskStatus, Task } from '../../../../core/models/task.model';
import { ConfirmDialog } from '../../../../shared/ui/confirm-dialog/confirm-dialog';
import { Skeleton } from '../../../../shared/ui/skeleton/skeleton';
import { TaskDialogService } from '../../../tasks/task-dialog.service';
import { StatCardsGrid } from '../../components/stat-cards-grid/stat-cards-grid';
import { TaskToolbar } from '../../components/task-toolbar/task-toolbar';
import { BoardColumn } from '../../components/board-column/board-column';
import { boardColumnListId, computeTaskOrderPatches } from '../../utils/board-drag-drop.utils';

const BOARD_STATUSES: readonly TaskStatus[] = ['todo', 'in_progress', 'done'];

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
  imports: [MatButtonModule, MatIconModule, Skeleton, StatCardsGrid, TaskToolbar, BoardColumn],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.scss',
})
export class DashboardPage {
  protected readonly taskStore = inject(TaskStore);
  protected readonly userStore = inject(UserStore);
  private readonly statisticsStore = inject(StatisticsStore);
  private readonly dialog = inject(MatDialog);
  private readonly taskDialog = inject(TaskDialogService);

  /** Every column connects to every column (including itself) so a card can be dragged anywhere. */
  protected readonly connectedLists = BOARD_STATUSES.map(boardColumnListId);

  protected readonly statistics = computed(() =>
    mergeLiveStatistics(this.statisticsStore.statistics(), this.taskStore.counts()),
  );

  /**
   * True only for the *first* load (no tasks yet) — a later `reload()`
   * setting `isLoading` again shouldn't blank an already-populated board
   * back to skeletons.
   */
  protected readonly isInitialLoading = computed(
    () => this.taskStore.isLoading() && this.taskStore.tasks().length === 0,
  );

  protected onStatusChange(status: TaskStatus | 'all'): void {
    this.taskStore.setFilters({ status });
  }

  protected onPriorityChange(priority: TaskPriority | 'all'): void {
    this.taskStore.setFilters({ priority });
  }

  protected onAssigneeChange(assigneeId: string): void {
    this.taskStore.setFilters({ assigneeId });
  }

  protected onNewTask(): void {
    this.taskDialog.createTask();
  }

  protected onEditTask(task: Task): void {
    this.taskDialog.editTask(task);
  }

  /** Double-click-to-rename on the card — the inline half of "inline or modal" editing. */
  protected onQuickEditTask(event: { task: Task; patch: TaskPatch }): void {
    this.taskStore.update(event.task.id, event.patch).catch(() => {
      // errorInterceptor already surfaced a snackbar for the failure.
    });
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

  /**
   * Drag-and-drop between/within columns. `BoardColumn` forwards the raw
   * CDK event unchanged because a cross-column move needs both columns'
   * current order at once, which no single `BoardColumn` instance has.
   * The actual reorder math lives in `computeTaskOrderPatches` — a pure
   * function, tested directly — this just applies whatever it returns.
   */
  protected onTaskMoved(event: CdkDragDrop<readonly Task[]>): void {
    for (const patch of computeTaskOrderPatches(event)) {
      this.taskStore.move(patch.taskId, patch.status, patch.order).catch(() => {
        // errorInterceptor already surfaced a snackbar for the failure.
      });
    }
  }
}
