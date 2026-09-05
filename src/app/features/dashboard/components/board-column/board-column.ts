import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import type { CdkDragDrop } from '@angular/cdk/drag-drop';
import { CdkDrag, CdkDropList } from '@angular/cdk/drag-drop';
import { TranslatePipe } from '../../../../core/i18n/translate.pipe';
import { TranslationService } from '../../../../core/i18n/translation.service';
import type { Task, TaskPatch, TaskStatus } from '../../../../core/models/task.model';
import { isOptimisticId } from '../../../../core/utils/id.utils';
import { TaskCard } from '../task-card/task-card';
import { boardColumnListId } from '../../utils/board-drag-drop.utils';

/**
 * One kanban column (To Do / In Progress / Done) — header, count badge,
 * cards. This is a cdkDropList for drag-and-drop (the brief's optional
 * "would be awesome" feature), and it emits the raw CdkDragDrop event
 * unchanged. DashboardPage owns the actual reordering math, since a
 * cross-column move needs to see both columns, which one BoardColumn
 * never can.
 */
@Component({
  selector: 'app-board-column',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TaskCard, CdkDropList, CdkDrag, TranslatePipe],
  templateUrl: './board-column.html',
  styleUrl: './board-column.scss',
})
export class BoardColumn {
  readonly title = input.required<string>();
  readonly status = input.required<TaskStatus>();
  readonly tasks = input.required<readonly Task[]>();
  /**
   * ids of every drop list a task may be dragged into, including this one.
   * `string[]`, not `readonly string[]` — CdkDropListConnectedTo's own
   * input type requires a mutable array.
   */
  readonly connectedLists = input<string[]>([]);

  readonly taskEdit = output<Task>();
  readonly taskDelete = output<Task>();
  readonly taskQuickEdit = output<{ task: Task; patch: TaskPatch }>();
  readonly taskMoved = output<CdkDragDrop<readonly Task[]>>();

  private readonly i18n = inject(TranslationService);

  protected readonly listId = computed(() => boardColumnListId(this.status()));
  protected readonly regionLabel = computed(() =>
    this.i18n.translate('board.regionLabel', { title: this.title() }),
  );

  protected isPending(task: Task): boolean {
    return isOptimisticId(task.id);
  }
}
