import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import type { MatButtonToggleChange } from '@angular/material/button-toggle';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import type { TaskPriority, TaskStatus } from '../../../../core/models/task.model';

const PRIORITY_LABELS: Record<TaskPriority | 'all', string> = {
  all: 'Priority',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

/** Status tabs + priority filter + "New Task" shortcut above the board. */
@Component({
  selector: 'app-task-toolbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonToggleModule, MatButtonModule, MatIconModule, MatMenuModule],
  templateUrl: './task-toolbar.html',
  styleUrl: './task-toolbar.scss',
})
export class TaskToolbar {
  readonly activeStatus = input<TaskStatus | 'all'>('all');
  readonly activePriority = input<TaskPriority | 'all'>('all');

  readonly statusChange = output<TaskStatus | 'all'>();
  readonly priorityChange = output<TaskPriority | 'all'>();
  readonly newTaskClick = output<void>();

  protected readonly priorityLabel = computed(() => PRIORITY_LABELS[this.activePriority()]);

  protected onStatusChange(event: MatButtonToggleChange): void {
    this.statusChange.emit(event.value as TaskStatus | 'all');
  }
}
