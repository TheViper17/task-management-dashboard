import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import type { ActivityEntry, ActivityType } from '../../../../core/models/activity.model';
import { formatRelativeTime } from '../../../../core/utils/date.utils';

const META: Record<ActivityType, { icon: string; verb: string }> = {
  created: { icon: 'add_circle', verb: 'created' },
  updated: { icon: 'edit', verb: 'updated' },
  moved: { icon: 'swap_horiz', verb: 'moved' },
  completed: { icon: 'check_circle', verb: 'completed' },
  deleted: { icon: 'delete', verb: 'deleted' },
};

/** Recent-activity list — icon, "you {verb} {task}", relative time. */
@Component({
  selector: 'app-activity-feed',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  templateUrl: './activity-feed.html',
  styleUrl: './activity-feed.scss',
})
export class ActivityFeed {
  readonly entries = input.required<readonly ActivityEntry[]>();

  protected icon(type: ActivityType): string {
    return META[type].icon;
  }

  protected verb(type: ActivityType): string {
    return META[type].verb;
  }

  protected relativeTime(iso: string): string {
    return formatRelativeTime(iso);
  }
}
