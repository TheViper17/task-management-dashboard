import { ChangeDetectionStrategy, Component, computed, effect, input, output } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import type { Assignee, CreateTaskDto, Task } from '../../../../core/models/task.model';
import {
  assigneeExistsValidator,
  maxTagsValidator,
  nonBlankValidator,
  notInPastValidator,
} from '../../validators/task.validators';

const MAX_TAGS = 5;

/**
 * Create/edit task form. Presentational: takes an optional `task` (absent =
 * create mode) and the assignee directory, emits `save` with a ready-to-send
 * `CreateTaskDto` on valid submit, or `cancel`. The host (`TaskFormDialog`)
 * decides whether that DTO becomes a POST or a PATCH.
 *
 * Demonstrates every "Forms" requirement from the brief:
 *  - custom validators: notInPastValidator, assigneeExistsValidator,
 *    maxTagsValidator, nonBlankValidator (task.validators.ts, unit tested
 *    independently of this component)
 *  - dynamic form controls: `tags` is a FormArray the user grows/shrinks
 *  - form state management: the due-date validator itself changes based on
 *    create vs. edit mode (see the constructor effect below)
 *  - error handling and display: touched-gated mat-error per field
 */
@Component({
  selector: 'app-task-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './task-form.html',
  styleUrl: './task-form.scss',
})
export class TaskForm {
  readonly task = input<Task | null>(null);
  readonly assignees = input.required<readonly Assignee[]>();

  readonly save = output<CreateTaskDto>();
  // Named `cancelled`, not `cancel` — @angular-eslint/no-output-native
  // forbids outputs named after native DOM events (cancel is one).
  readonly cancelled = output<void>();

  protected readonly isCreateMode = computed(() => !this.task());

  protected readonly newTagControl = new FormControl('', { nonNullable: true });

  protected readonly form = new FormGroup({
    title: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3), Validators.maxLength(120)],
    }),
    description: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(10), Validators.maxLength(500)],
    }),
    status: new FormControl<Task['status']>('todo', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    priority: new FormControl<Task['priority']>('medium', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    dueDate: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    assigneeId: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, assigneeExistsValidator(() => this.assignees())],
    }),
    tags: new FormArray<FormControl<string>>([], { validators: [maxTagsValidator(MAX_TAGS)] }),
  });

  protected get tagsControl(): FormArray<FormControl<string>> {
    return this.form.controls.tags;
  }

  constructor() {
    // Reacts to `task` changing: pre-fills the form for edit mode, and
    // toggles the due-date validator — a brand-new task can't be created
    // already overdue, but editing one shouldn't force its date forward.
    effect(() => {
      const task = this.task();
      const dueDateControl = this.form.controls.dueDate;

      if (task) {
        this.form.patchValue({
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          dueDate: task.dueDate,
          assigneeId: task.assigneeId,
        });
        this.setTags(task.tags);
        dueDateControl.setValidators([Validators.required]);
      } else {
        dueDateControl.setValidators([Validators.required, notInPastValidator()]);
      }
      dueDateControl.updateValueAndValidity({ emitEvent: false });
    });
  }

  protected onAddTag(): void {
    const value = this.newTagControl.value.trim();
    if (!value || this.tagsControl.length >= MAX_TAGS) return;

    this.tagsControl.push(
      new FormControl(value, { nonNullable: true, validators: [nonBlankValidator()] }),
    );
    this.newTagControl.reset('');
  }

  protected removeTag(index: number): void {
    this.tagsControl.removeAt(index);
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    this.save.emit({
      title: value.title,
      description: value.description,
      status: value.status,
      priority: value.priority,
      dueDate: value.dueDate,
      assigneeId: value.assigneeId,
      tags: value.tags,
    });
  }

  private setTags(tags: readonly string[]): void {
    this.tagsControl.clear();
    for (const tag of tags) {
      this.tagsControl.push(
        new FormControl(tag, { nonNullable: true, validators: [nonBlankValidator()] }),
      );
    }
  }
}
