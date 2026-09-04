import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import type { TaskPriority } from '../../../core/models/task.model';

/** Small coloured pill for a task's priority — HIGH / MEDIUM / LOW. */
@Component({
  selector: 'app-priority-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UpperCasePipe],
  templateUrl: './priority-badge.html',
  styleUrl: './priority-badge.scss',
})
export class PriorityBadge {
  readonly priority = input.required<TaskPriority>();
}
