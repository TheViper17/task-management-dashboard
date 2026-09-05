import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import type { ElementRef } from '@angular/core';
import { CdkDragHandle } from '@angular/cdk/drag-drop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { TranslatePipe } from '../../../../core/i18n/translate.pipe';
import { TranslationService } from '../../../../core/i18n/translation.service';
import type { Task, TaskPatch } from '../../../../core/models/task.model';
import { isTaskOverdue } from '../../../../core/utils/task.utils';
import { isOptimisticId } from '../../../../core/utils/id.utils';
import {
  validateDescriptionText,
  validateTitleText,
} from '../../../tasks/validators/task.validators';
import { Avatar } from '../../../../shared/ui/avatar/avatar';
import { DueDateChip } from '../../../../shared/ui/due-date-chip/due-date-chip';
import { PriorityBadge } from '../../../../shared/ui/priority-badge/priority-badge';

/** Which field, if any, is currently being edited in place on the card. */
type EditableField = 'title' | 'description' | null;

/**
 * A single board card. The hover accent colour follows the column (blue
 * for To Do, amber for In Progress, green for Done — see design.png),
 * except an overdue task always gets the red/pink treatment regardless of
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
    TranslatePipe,
    Avatar,
    DueDateChip,
    PriorityBadge,
  ],
  templateUrl: './task-card.html',
  styleUrl: './task-card.scss',
})
export class TaskCard {
  private readonly i18n = inject(TranslationService);

  readonly task = input.required<Task>();

  readonly edit = output<void>();
  readonly delete = output<void>();
  /**
   * A title/description edited in place, ready for TaskStore.update().
   * Kept separate from edit (which opens the full modal) — the brief
   * allows "inline or modal," and this covers the two fields quick enough
   * to rename without leaving the board. Status, priority, due date,
   * assignee, and tags still go through the modal.
   */
  readonly quickEdit = output<TaskPatch>();

  private readonly titleInput = viewChild<ElementRef<HTMLInputElement>>('titleInput');
  private readonly descriptionInput =
    viewChild<ElementRef<HTMLTextAreaElement>>('descriptionInput');

  protected readonly editingField = signal<EditableField>(null);
  protected readonly draftValue = signal('');
  protected readonly draftError = signal<string | null>(null);

  constructor() {
    // Focuses (and for the single-line title, selects) whichever field
    // just became editable. Runs after the @if swaps in the input/textarea,
    // since effects react to the rendered view, not just the signal write.
    effect(() => {
      const field = this.editingField();
      if (field === 'title') {
        const el = this.titleInput()?.nativeElement;
        el?.focus();
        el?.select();
      } else if (field === 'description') {
        this.descriptionInput()?.nativeElement.focus();
      }
    });
  }

  protected readonly isOverdue = computed(() => isTaskOverdue(this.task()));
  protected readonly isPending = computed(() => isOptimisticId(this.task().id));
  protected readonly accentClass = computed(() =>
    this.isOverdue() ? 'task-card--overdue' : `task-card--${this.task().status}`,
  );
  protected readonly tags = computed(() => this.task().tags);

  /**
   * Never trust task().assignee to actually be there. Even though the
   * mock backend's create/update quirk is fixed upstream in TaskStore, a
   * template reading task.assignee.name directly crashes the whole render
   * the moment that assumption is wrong for any reason — a stale cache
   * entry, a deleted user, a future backend inconsistency. Falling back
   * to "Unassigned" is a UI bug; a crash mid-render is a much worse one.
   */
  protected readonly assigneeInitials = computed(() => this.task().assignee?.avatar ?? '?');
  protected readonly assigneeFirstName = computed(() => {
    const name = this.task().assignee?.name;
    return name ? name.split(' ')[0] : this.i18n.translate('task.unassigned');
  });

  protected startEditing(field: 'title' | 'description'): void {
    // An optimistic task has no server id yet — there's nothing to PATCH.
    if (this.isPending()) return;
    this.draftValue.set(field === 'title' ? this.task().title : this.task().description);
    this.draftError.set(null);
    this.editingField.set(field);
  }

  protected cancelEdit(): void {
    this.editingField.set(null);
    this.draftError.set(null);
  }

  /**
   * Validates and, if changed, emits the draft. Reachable from both a
   * field's (blur) and Enter/Cmd+Enter — guarded by editingField() so a
   * blur that fires after Escape already closed the field (removing it
   * from the DOM triggers a blur too) is a harmless no-op, not a second
   * commit.
   */
  protected commitEdit(): void {
    const field = this.editingField();
    if (!field) return;

    const value = this.draftValue().trim();
    const error = field === 'title' ? validateTitleText(value) : validateDescriptionText(value);
    if (error) {
      this.draftError.set(this.i18n.translate(error.key, error.params));
      return; // keep editing so the user can fix it, or press Escape to cancel
    }

    this.editingField.set(null);
    this.draftError.set(null);

    const original = field === 'title' ? this.task().title : this.task().description;
    if (value === original) return; // unchanged — nothing worth a PATCH for

    this.quickEdit.emit(field === 'title' ? { title: value } : { description: value });
  }

  protected onTitleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault(); // single-line field — Enter commits, doesn't insert a newline
      this.commitEdit();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.cancelEdit();
    }
  }

  protected onDescriptionKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.cancelEdit();
    } else if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault(); // plain Enter still inserts a newline — it's a textarea
      this.commitEdit();
    }
  }
}
