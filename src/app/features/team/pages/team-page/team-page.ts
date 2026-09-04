import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { TranslatePipe } from '../../../../core/i18n/translate.pipe';
import { TaskStore } from '../../../../core/stores/task.store';
import { UserStore } from '../../../../core/stores/user.store';
import { UserCard } from '../../components/user-card/user-card';

/** Team directory — every assignee, with how many tasks are currently theirs. */
@Component({
  selector: 'app-team-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UserCard, TranslatePipe],
  templateUrl: './team-page.html',
  styleUrl: './team-page.scss',
})
export class TeamPage {
  protected readonly userStore = inject(UserStore);
  private readonly taskStore = inject(TaskStore);

  protected readonly isInitialLoading = computed(
    () => this.userStore.isLoading() && this.userStore.users().length === 0,
  );

  private readonly taskCountByUser = computed(() => {
    const counts = new Map<string, number>();
    for (const task of this.taskStore.tasks()) {
      counts.set(task.assigneeId, (counts.get(task.assigneeId) ?? 0) + 1);
    }
    return counts;
  });

  protected taskCountFor(userId: string): number {
    return this.taskCountByUser().get(userId) ?? 0;
  }
}
