import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import type { TaskPriority } from '../../../core/models/task.model';

/**
 * Small coloured pill for a task's priority — HIGH / MEDIUM / LOW.
 * | uppercase runs after translation and is a harmless no-op for Arabic
 * (the script has no case distinction), so it stays unconditional
 * instead of needing a language check.
 */
@Component({
  selector: 'app-priority-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UpperCasePipe, TranslatePipe],
  templateUrl: './priority-badge.html',
  styleUrl: './priority-badge.scss',
})
export class PriorityBadge {
  readonly priority = input.required<TaskPriority>();

  protected readonly priorityKey = computed(() => `priority.${this.priority()}` as const);
}
