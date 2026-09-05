import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { TranslationService } from '../../../core/i18n/translation.service';
import { describeDueDate } from '../../../core/utils/date.utils';
import type { TaskStatus } from '../../../core/models/task.model';

/**
 * Renders a task's due-date state the way the board cards need it:
 * "Overdue by N days" (red), "Due today/tomorrow/in N days" (muted), or
 * "Completed today/yesterday" (green). All the date math lives in
 * describeDueDate (core/utils/date.utils) — this just resolves the
 * resulting translation key to text and renders it.
 */
@Component({
  selector: 'app-due-date-chip',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  templateUrl: './due-date-chip.html',
  styleUrl: './due-date-chip.scss',
})
export class DueDateChip {
  private readonly i18n = inject(TranslationService);

  readonly dueDate = input.required<string>();
  readonly status = input.required<TaskStatus>();
  readonly completedAt = input<string | undefined>(undefined);

  protected readonly info = computed(() =>
    describeDueDate(this.dueDate(), this.status(), this.completedAt()),
  );

  protected readonly label = computed(() => {
    const info = this.info();
    return this.i18n.translate(info.key, info.params);
  });
}
