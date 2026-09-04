import type { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import type { Assignee } from '../../../core/models/task.model';

/**
 * Rejects a due date earlier than today. Compares whole days, ignoring
 * time-of-day, so "today" is always valid regardless of the current hour.
 */
export function notInPastValidator(): ValidatorFn {
  return (control: AbstractControl<string>): ValidationErrors | null => {
    const value: string = control.value;
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
