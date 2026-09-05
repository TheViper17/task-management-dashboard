import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
} from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TranslatePipe } from '../../../../core/i18n/translate.pipe';
import { TranslationService } from '../../../../core/i18n/translation.service';
import type { Assignee, CreateTaskDto, Task } from '../../../../core/models/task.model';
import { parseIsoDateLocal, toIsoDateString } from '../../../../core/utils/date.utils';
import {
  DESCRIPTION_MAX_LENGTH,
  DESCRIPTION_MIN_LENGTH,
  TITLE_MAX_LENGTH,
  TITLE_MIN_LENGTH,
  assigneeExistsValidator,
  maxTagsValidator,
  nonBlankValidator,
  notInPastValidator,
} from '../../validators/task.validators';

const MAX_TAGS = 5;

/**
 * Create/edit task form. Presentational — takes an optional task (absent
 * means create mode) and the assignee directory, emits save with a
 * ready-to-send CreateTaskDto on valid submit, or cancelled. The host
 * (TaskFormDialog) decides whether that DTO becomes a POST or a PATCH.
 *
 * Covers every "Forms" item in the brief:
 *  - custom validators: notInPastValidator, assigneeExistsValidator,
 *    maxTagsValidator, nonBlankValidator (task.validators.ts, tested on
 *    their own, independent of this component)
 *  - dynamic form controls: tags is a FormArray the user grows and shrinks
 *  - form state management: the due-date validator changes based on
 *    create vs. edit mode (see the constructor effect below)
 *  - error handling and display: touched-gated mat-error per field
 */
@Component({
  selector: 'app-task-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    TranslatePipe,
  ],
  // Scoped here, not app-wide in app.config.ts — the datepicker is only
  // used by this form, so its adapter shouldn't ride along in every
  // route's bundle. MAT_DATE_LOCALE is read once at construction, not
  // bound reactively, since nothing needs it to be: switching language
  // reloads the page anyway (see TranslationService), so "correct at
  // construction" is already "always correct." In English mode this
  // factory returns the same 'en-US' the tests assert an exact date
  // against.
  providers: [
    provideNativeDateAdapter(),
    {
      provide: MAT_DATE_LOCALE,
      useFactory: () => (inject(TranslationService).locale() === 'ar' ? 'ar' : 'en-US'),
    },
  ],
  templateUrl: './task-form.html',
  styleUrl: './task-form.scss',
})
export class TaskForm {
  readonly task = input<Task | null>(null);
  readonly assignees = input.required<readonly Assignee[]>();

  readonly save = output<CreateTaskDto>();
  // Named cancelled, not cancel — @angular-eslint/no-output-native blocks
  // outputs named after native DOM events, and cancel is one.
  readonly cancelled = output<void>();

  protected readonly isCreateMode = computed(() => !this.task());

  protected readonly newTagControl = new FormControl('', { nonNullable: true });

  protected readonly form = new FormGroup({
    title: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.minLength(TITLE_MIN_LENGTH),
        Validators.maxLength(TITLE_MAX_LENGTH),
      ],
    }),
    description: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.minLength(DESCRIPTION_MIN_LENGTH),
        Validators.maxLength(DESCRIPTION_MAX_LENGTH),
      ],
    }),
    status: new FormControl<Task['status']>('todo', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    priority: new FormControl<Task['priority']>('medium', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    // Holds a Date, not the app's usual "YYYY-MM-DD" string — that's what
    // mat-datepicker's native adapter speaks. Converted at the two
    // boundaries this component owns: parseIsoDateLocal/toIsoDateString,
    // in the effect below and in onSubmit().
    dueDate: new FormControl<Date | null>(null, { validators: [Validators.required] }),
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
    // Reacts to task changing: pre-fills the form for edit mode, and
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
          dueDate: parseIsoDateLocal(task.dueDate),
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

    // Non-null: dueDate is Validators.required and the form's valid at
    // this point, so the typed value is always here.
    const value = this.form.getRawValue();
    this.save.emit({
      title: value.title,
      description: value.description,
      status: value.status,
      priority: value.priority,
      dueDate: toIsoDateString(value.dueDate!),
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
