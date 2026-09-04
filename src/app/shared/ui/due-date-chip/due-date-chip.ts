import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { describeDueDate } from '../../../core/utils/date.utils';
import type { TaskStatus } from '../../../core/models/task.model';

/**
 * Renders a task's due-date state exactly as the board cards need it:
 * "Overdue by N days" (red), "Due today/tomorrow/in N days" (muted), or
 * "Completed today/yesterday" (green). All the date math lives in
 * `describeDueDate` (core/utils/date.utils) — this component only renders.
 */
@Component({
  selector: 'app-due-date-chip',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  templateUrl: './due-date-chip.html',
  styleUrl: './due-date-chip.scss',
})
export class DueDateChip {
  readonly dueDate = input.required<string>();
  readonly status = input.required<TaskStatus>();
  readonly completedAt = input<string | undefined>(undefined);

  protected readonly info = computed(() =>
    describeDueDate(this.dueDate(), this.status(), this.completedAt()),
  );
}
