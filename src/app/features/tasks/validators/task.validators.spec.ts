import { FormControl } from '@angular/forms';
import type { Assignee } from '../../../core/models/task.model';
import {
  assigneeExistsValidator,
  maxTagsValidator,
  nonBlankValidator,
  notInPastValidator,
} from './task.validators';

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
