import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { TranslationService } from '../../../../core/i18n/translation.service';
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
  private readonly i18n = inject(TranslationService);

  readonly user = input.required<Assignee>();
  readonly taskCount = input(0);

  protected readonly taskCountLabel = computed(() =>
    this.i18n.translate('team.taskCount', { count: this.taskCount() }),
  );
}
