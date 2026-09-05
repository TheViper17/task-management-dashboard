import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * A single pulsing placeholder block. Compose several to sketch the
 * shape of whatever's loading (a stat card, a task card, ...) — see
 * dashboard-page.html for the composed skeletons. aria-hidden because
 * the loading state gets announced once, at the container level
 * (role="status"), not per block.
 */
@Component({
  selector: 'app-skeleton',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span
      class="skeleton"
      aria-hidden="true"
      [style.width]="width()"
      [style.height]="height()"
      [style.border-radius]="radius()"
    ></span>
  `,
  styleUrl: './skeleton.scss',
})
export class Skeleton {
  readonly width = input('100%');
  readonly height = input('16px');
  readonly radius = input('var(--app-radius-sm)');
}
