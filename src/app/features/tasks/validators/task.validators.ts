import type { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import type { TranslateParams } from '../../../core/i18n/translation.model';
import type { TranslationKey } from '../../../core/i18n/translations/en';
import type { Assignee } from '../../../core/models/task.model';

// Single source of truth for title/description length constraints — used by
// TaskForm's reactive-forms Validators.min/maxLength below, and by
// TaskCard's lightweight double-click-to-rename inline editing
// (validateTitleText/validateDescriptionText), which doesn't use reactive
// forms but must enforce the same rules so a title/description edited
// in-place can't drift out of sync with one edited via the modal.
export const TITLE_MIN_LENGTH = 3;
export const TITLE_MAX_LENGTH = 120;
export const DESCRIPTION_MIN_LENGTH = 10;
export const DESCRIPTION_MAX_LENGTH = 500;

/**
 * A validation failure as a translation key + params rather than a formatted
 * string — these two functions are plain, framework-agnostic code (no
 * `inject()`, independently unit-tested), so they can't call
 * `TranslationService` themselves. The caller (`TaskCard`) resolves the
 * actual wording via `i18n.translate(error.key, error.params)`.
 */
export interface TextValidationError {
  key: TranslationKey;
  params?: TranslateParams;
}

/** Validates a task title typed outside reactive forms; `null` means valid. */
export function validateTitleText(value: string): TextValidationError | null {
  if (!value) return { key: 'taskForm.titleRequired' };
  if (value.length < TITLE_MIN_LENGTH) return { key: 'taskForm.titleMinLength' };
  if (value.length > TITLE_MAX_LENGTH) return { key: 'taskForm.titleMaxLength' };
  return null;
}

/** Validates a task description typed outside reactive forms; `null` means valid. */
export function validateDescriptionText(value: string): TextValidationError | null {
  if (!value) return { key: 'taskForm.descriptionRequired' };
  if (value.length < DESCRIPTION_MIN_LENGTH) return { key: 'taskForm.descriptionMinLength' };
  if (value.length > DESCRIPTION_MAX_LENGTH) return { key: 'taskForm.descriptionMaxLength' };
  return null;
}

/**
 * Rejects a due date earlier than today. Compares whole days, ignoring
 * time-of-day, so "today" is always valid regardless of the current hour.
 *
 * Accepts either a `"YYYY-MM-DD"` string or a `Date` — `TaskForm`'s due-date
 * control holds a `Date` (mat-datepicker's native adapter), but this is
 * exercised directly against strings in its own spec, and `new Date(value)`
 * handles both identically.
 */
export function notInPastValidator(): ValidatorFn {
  return (control: AbstractControl<string | Date | null>): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null; // let Validators.required handle emptiness

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(value);
    due.setHours(0, 0, 0, 0);

    return due.getTime() < today.getTime() ? { pastDate: true } : null;
  };
}

/**
 * Ensures the selected assignee id refers to a currently known assignee.
 * Takes a getter (rather than a snapshot array) so it always checks against
 * the *current* directory — assignees load asynchronously from the API, so
 * a snapshot captured when the form was built could go stale.
 */
export function assigneeExistsValidator(getAssignees: () => readonly Assignee[]): ValidatorFn {
  return (control: AbstractControl<string>): ValidationErrors | null => {
    const value: string = control.value;
    if (!value) return null;
    return getAssignees().some((assignee) => assignee.id === value)
      ? null
      : { unknownAssignee: true };
  };
}

/** Caps a tags `FormArray`'s length at `max` entries. */
export function maxTagsValidator(max: number): ValidatorFn {
  return (control: AbstractControl<string[]>): ValidationErrors | null => {
    const length: number = control.value?.length ?? 0;
    return length > max ? { maxTags: { max, actual: length } } : null;
  };
}

/** Rejects a blank or whitespace-only value — used for individual tag controls. */
export function nonBlankValidator(): ValidatorFn {
  return (control: AbstractControl<string>): ValidationErrors | null => {
    const value: string = control.value ?? '';
    return value.trim().length === 0 ? { blank: true } : null;
  };
}
