import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { Assignee } from '../../../../core/models/task.model';
import { Avatar } from '../../../../shared/ui/avatar/avatar';

/** One team member: avatar, name, email, and how many tasks are assigned to them. */
@Component({
  selector: 'app-user-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Avatar],
  templateUrl: './user-card.html',
  styleUrl: './user-card.scss',
})
export class UserCard {
  readonly user = input.required<Assignee>();
  readonly taskCount = input(0);
}
