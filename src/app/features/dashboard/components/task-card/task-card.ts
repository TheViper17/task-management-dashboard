import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { CdkDragHandle } from '@angular/cdk/drag-drop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import type { Task } from '../../../../core/models/task.model';
import { isTaskOverdue } from '../../../../core/utils/task.utils';
import { isOptimisticId } from '../../../../core/utils/id.utils';
import { Avatar } from '../../../../shared/ui/avatar/avatar';
import { DueDateChip } from '../../../../shared/ui/due-date-chip/due-date-chip';
import { PriorityBadge } from '../../../../shared/ui/priority-badge/priority-badge';

/**
 * A single board card. The hover accent colour is column-derived (blue for
 * To Do, amber for In Progress, green for Done — see design.png), except an
 * overdue task always gets the red/pink overdue treatment regardless of
 * column, matching the design's overdue card variants.
 */
@Component({
  selector: 'app-task-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CdkDragHandle,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    Avatar,
    DueDateChip,
    PriorityBadge,
  ],
  templateUrl: './task-card.html',
  styleUrl: './task-card.scss',
})
export class TaskCard {
  readonly task = input.required<Task>();

  readonly edit = output<void>();
  readonly delete = output<void>();

  protected readonly isOverdue = computed(() => isTaskOverdue(this.task()));
  protected readonly isPending = computed(() => isOptimisticId(this.task().id));
  protected readonly accentClass = computed(() =>
    this.isOverdue() ? 'task-card--overdue' : `task-card--${this.task().status}`,
  );
  protected readonly tag = computed(() => this.task().tags[0]);

  /**
   * Never trust `task().assignee` to be present — defensive by design, not
   * just because of the mock backend's create/update quirk (already fixed
   * upstream in TaskStore): a template that does `task.assignee.name`
   * directly crashes the whole render pass the moment that assumption is
   * ever wrong, for *any* reason (a stale cache entry, a user later
   * deleted from the directory, a future backend inconsistency). Falling
   * back to a visible "Unassigned" is a UI bug; an uncaught TypeError
   * during change detection is a much worse one.
   */
  protected readonly assigneeInitials = computed(() => this.task().assignee?.avatar ?? '?');
  protected readonly assigneeFirstName = computed(() => {
    const name = this.task().assignee?.name;
    return name ? name.split(' ')[0] : 'Unassigned';
  });
}
