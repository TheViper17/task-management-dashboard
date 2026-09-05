import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { TranslationService } from '../../../../core/i18n/translation.service';
import type { TranslationKey } from '../../../../core/i18n/translations/en';
import type { Statistic } from '../../../../core/models/statistic.model';

/**
 * title/changeLabel are free text from the (mock) statistics API — a
 * real backend's own copy, not this app's. Rather than trying to
 * translate arbitrary server text, each known stat is matched by its
 * stable id to a translation key here; an id this map doesn't recognise
 * falls back to the server's own text untranslated.
 */
const TITLE_KEY_BY_ID: Record<string, TranslationKey> = {
  'stat-001': 'stat.totalTasks',
  'stat-002': 'common.completed',
  'stat-003': 'status.inProgress',
  'stat-004': 'stat.overdue',
};

const CHANGE_LABEL_KEY_BY_TEXT: Record<string, TranslationKey> = {
  'this week': 'stat.changeThisWeek',
  today: 'stat.changeToday',
  'Same as yesterday': 'stat.changeSameAsYesterday',
};

/**
 * One dashboard stat card (Total Tasks / Completed / In Progress /
 * Overdue). The delta line reads "{change} {changeLabel}" (e.g. "+12 this
 * week"), except when change is literally "0" — then it's just the label
 * ("Same as yesterday"), matching the Figma "In Progress" card.
 */
@Component({
  selector: 'app-stat-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './stat-card.html',
  styleUrl: './stat-card.scss',
})
export class StatCard {
  private readonly i18n = inject(TranslationService);

  readonly statistic = input.required<Statistic>();

  protected readonly title = computed(() => {
    const stat = this.statistic();
    const key = TITLE_KEY_BY_ID[stat.id];
    return key ? this.i18n.translate(key) : stat.title;
  });

  protected readonly deltaText = computed(() => {
    const stat = this.statistic();
    const labelKey = CHANGE_LABEL_KEY_BY_TEXT[stat.changeLabel];
    const label = labelKey ? this.i18n.translate(labelKey) : stat.changeLabel;
    return stat.change === '0' ? label : `${stat.change} ${label}`;
  });
}
