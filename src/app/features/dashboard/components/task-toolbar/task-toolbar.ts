import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import type { MatButtonToggleChange } from '@angular/material/button-toggle';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { TranslatePipe } from '../../../../core/i18n/translate.pipe';
import { TranslationService } from '../../../../core/i18n/translation.service';
import type { Assignee, TaskPriority, TaskStatus } from '../../../../core/models/task.model';

/** Status tabs + priority/assignee filters + "New Task" shortcut above the board. */
@Component({
  selector: 'app-task-toolbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonToggleModule, MatButtonModule, MatIconModule, MatMenuModule, TranslatePipe],
  templateUrl: './task-toolbar.html',
  styleUrl: './task-toolbar.scss',
})
export class TaskToolbar {
  private readonly i18n = inject(TranslationService);

  readonly activeStatus = input<TaskStatus | 'all'>('all');
  readonly activePriority = input<TaskPriority | 'all'>('all');
  /** `'all'` is the sentinel for "no assignee filter" — see `TaskFilters`. */
  readonly activeAssigneeId = input<string>('all');
  readonly assignees = input<readonly Assignee[]>([]);

  readonly statusChange = output<TaskStatus | 'all'>();
  readonly priorityChange = output<TaskPriority | 'all'>();
  readonly assigneeChange = output<string>();
  readonly newTaskClick = output<void>();

  protected readonly priorityLabel = computed(() => {
    const priority = this.activePriority();
    return priority === 'all'
      ? this.i18n.translate('priority.label')
      : this.i18n.translate(`priority.${priority}`);
  });

  protected readonly assigneeLabel = computed(() => {
    const id = this.activeAssigneeId();
    if (id === 'all') return this.i18n.translate('toolbar.assigneeLabel');
    return (
      this.assignees().find((assignee) => assignee.id === id)?.name ??
      this.i18n.translate('toolbar.assigneeLabel')
    );
  });

  protected onStatusChange(event: MatButtonToggleChange): void {
    this.statusChange.emit(event.value as TaskStatus | 'all');
  }
}
