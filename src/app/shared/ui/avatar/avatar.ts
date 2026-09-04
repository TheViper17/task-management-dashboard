import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * A circular initials badge, used for the current user in the header and
 * for task assignees on cards. Purely presentational — no store, no
 * business logic — so it's testable as a plain render-and-assert.
 */
@Component({
  selector: 'app-avatar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './avatar.html',
  styleUrl: './avatar.scss',
})
export class Avatar {
  readonly initials = input.required<string>();
  readonly size = input(36);
}
