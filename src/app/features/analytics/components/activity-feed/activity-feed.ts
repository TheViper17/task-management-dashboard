import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '../../../../core/i18n/translate.pipe';
import { TranslationService } from '../../../../core/i18n/translation.service';
import type { TranslationKey } from '../../../../core/i18n/translations/en';
import type { ActivityEntry, ActivityType } from '../../../../core/models/activity.model';
import { describeRelativeTime } from '../../../../core/utils/date.utils';

const META: Record<ActivityType, { icon: string; verbKey: TranslationKey }> = {
  created: { icon: 'add_circle', verbKey: 'activity.created' },
  updated: { icon: 'edit', verbKey: 'activity.updated' },
  moved: { icon: 'swap_horiz', verbKey: 'activity.moved' },
  completed: { icon: 'check_circle', verbKey: 'activity.completed' },
  deleted: { icon: 'delete', verbKey: 'activity.deleted' },
};

/**
 * Recent-activity list — icon, "{verb phrase} {task}", relative time.
 * The verb phrase carries its own subject ("You created", not "You" +
 * "created" concatenated) — Arabic conjugates the verb for person, so
 * splitting a bare "You" out as a separate word doesn't translate
 * naturally the way it does in English.
 */
@Component({
  selector: 'app-activity-feed',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule, TranslatePipe],
  templateUrl: './activity-feed.html',
  styleUrl: './activity-feed.scss',
})
export class ActivityFeed {
  private readonly i18n = inject(TranslationService);

  readonly entries = input.required<readonly ActivityEntry[]>();

  protected icon(type: ActivityType): string {
    return META[type].icon;
  }

  protected verb(type: ActivityType): string {
    return this.i18n.translate(META[type].verbKey);
  }

  protected relativeTime(iso: string): string {
    const info = describeRelativeTime(iso);
    return this.i18n.translate(info.key, info.params);
  }
}
