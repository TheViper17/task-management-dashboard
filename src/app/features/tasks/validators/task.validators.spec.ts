import { FormControl } from '@angular/forms';
import type { Assignee } from '../../../core/models/task.model';
import {
  assigneeExistsValidator,
  maxTagsValidator,
  nonBlankValidator,
  notInPastValidator,
  validateDescriptionText,
  validateTitleText,
} from './task.validators';

describe('validateTitleText', () => {
  it('rejects an empty title', () => {
    expect(validateTitleText('')).toEqual({ key: 'taskForm.titleRequired' });
  });

  it('rejects a title under 3 characters', () => {
    expect(validateTitleText('ab')).toEqual({ key: 'taskForm.titleMinLength' });
  });

  it('rejects a title over 120 characters', () => {
    expect(validateTitleText('a'.repeat(121))).toEqual({ key: 'taskForm.titleMaxLength' });
  });

  it('accepts a title within range', () => {
    expect(validateTitleText('Design homepage')).toBeNull();
  });
});

describe('validateDescriptionText', () => {
  it('rejects an empty description', () => {
    expect(validateDescriptionText('')).toEqual({ key: 'taskForm.descriptionRequired' });
  });

  it('rejects a description under 10 characters', () => {
    expect(validateDescriptionText('too short')).toEqual({
      key: 'taskForm.descriptionMinLength',
    });
  });

  it('rejects a description over 500 characters', () => {
    expect(validateDescriptionText('a'.repeat(501))).toEqual({
      key: 'taskForm.descriptionMaxLength',
    });
  });

  it('accepts a description within range', () => {
    expect(validateDescriptionText('Create wireframes and mockups')).toBeNull();
  });
});

describe('notInPastValidator', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-09-04T12:00:00.000Z'));
  });

  afterEach(() => vi.useRealTimers());

  it('passes for an empty value (defers to Validators.required)', () => {
    const control = new FormControl('');
    expect(notInPastValidator()(control)).toBeNull();
  });

  it('passes for today', () => {
    const control = new FormControl('2026-09-04');
    expect(notInPastValidator()(control)).toBeNull();
  });

  it('passes for a future date', () => {
    const control = new FormControl('2026-09-10');
    expect(notInPastValidator()(control)).toBeNull();
  });

  it('fails for a past date', () => {
    const control = new FormControl('2026-09-01');
    expect(notInPastValidator()(control)).toEqual({ pastDate: true });
  });

  // TaskForm's due-date control holds a Date (mat-datepicker's native
  // adapter), not the "YYYY-MM-DD" string every test above uses.
  it('accepts and rejects a Date value identically to the equivalent string', () => {
    expect(notInPastValidator()(new FormControl(new Date(2026, 8, 10)))).toBeNull();
    expect(notInPastValidator()(new FormControl(new Date(2026, 8, 1)))).toEqual({
      pastDate: true,
    });
  });
});

describe('assigneeExistsValidator', () => {
  const assignees: Assignee[] = [
    { id: 'user-1', name: 'Ada Lovelace', avatar: 'AL', email: 'ada@company.com' },
  ];

  it('passes for an empty value (defers to Validators.required)', () => {
    const control = new FormControl('');
    expect(assigneeExistsValidator(() => assignees)(control)).toBeNull();
  });

  it('passes for a known assignee id', () => {
    const control = new FormControl('user-1');
    expect(assigneeExistsValidator(() => assignees)(control)).toBeNull();
  });

  it('fails for an unknown assignee id', () => {
    const control = new FormControl('user-999');
    expect(assigneeExistsValidator(() => assignees)(control)).toEqual({ unknownAssignee: true });
  });

  it('reads the assignee list live, not a stale snapshot', () => {
    let current: Assignee[] = [];
    const validator = assigneeExistsValidator(() => current);
    const control = new FormControl('user-1');

    expect(validator(control)).toEqual({ unknownAssignee: true });
    current = assignees;
    expect(validator(control)).toBeNull();
  });
});

describe('maxTagsValidator', () => {
  it('passes at or under the max', () => {
    const control = new FormControl(['a', 'b']);
    expect(maxTagsValidator(2)(control)).toBeNull();
  });

  it('fails over the max, with the max and actual count in the error', () => {
    const control = new FormControl(['a', 'b', 'c']);
    expect(maxTagsValidator(2)(control)).toEqual({ maxTags: { max: 2, actual: 3 } });
  });
});

describe('nonBlankValidator', () => {
  it('fails for an empty string', () => {
    expect(nonBlankValidator()(new FormControl(''))).toEqual({ blank: true });
  });

  it('fails for a whitespace-only string', () => {
    expect(nonBlankValidator()(new FormControl('   '))).toEqual({ blank: true });
  });

  it('passes for a non-blank string', () => {
    expect(nonBlankValidator()(new FormControl('Design'))).toBeNull();
  });
});
