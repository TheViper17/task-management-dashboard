import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import type { Task } from '../../../../core/models/task.model';
import { TaskCard } from '../task-card/task-card';

/** One kanban column (To Do / In Progress / Done) — header, count badge, cards. */
@Component({
  selector: 'app-board-column',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TaskCard],
  templateUrl: './board-column.html',
  styleUrl: './board-column.scss',
})
export class BoardColumn {
  readonly title = input.required<string>();
  readonly tasks = input.required<readonly Task[]>();

  readonly taskEdit = output<Task>();
  readonly taskDelete = output<Task>();
}
