import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import type { Observable } from 'rxjs';
import { TranslationService } from '../../core/i18n/translation.service';
import type { CreateTaskDto, Task } from '../../core/models/task.model';
import { NotificationService } from '../../core/services/notification.service';
import { TaskStore } from '../../core/stores/task.store';
import { UserStore } from '../../core/stores/user.store';
import { TaskFormDialog } from './components/task-form-dialog/task-form-dialog';
import type { TaskFormDialogData } from './components/task-form-dialog/task-form-dialog';

/**
 * Owns the full "open the create/edit dialog, then persist the result"
 * flow. Centralised here rather than duplicated everywhere a "New Task"
 * or "Edit" action lives — the sidebar, the dashboard toolbar, a task
 * card's menu — so every entry point behaves the same way.
 */
@Injectable({ providedIn: 'root' })
export class TaskDialogService {
  private readonly dialog = inject(MatDialog);
  private readonly userStore = inject(UserStore);
  private readonly taskStore = inject(TaskStore);
  private readonly notify = inject(NotificationService);
  private readonly i18n = inject(TranslationService);

  /** Opens the create-task dialog and, if submitted, creates the task. */
  createTask(): void {
    this.open(null).subscribe((dto) => {
      if (!dto) return;
      this.taskStore
        .create(dto)
        .then(() => this.notify.showSuccess(this.i18n.translate('notification.taskCreated')))
        .catch(() => {
          // errorInterceptor already surfaced a snackbar for the failure.
        });
    });
  }

  /** Opens the edit-task dialog for `task` and, if submitted, applies the changes. */
  editTask(task: Task): void {
    this.open(task).subscribe((dto) => {
      if (!dto) return;
      this.taskStore
        .update(task.id, dto)
        .then(() => this.notify.showSuccess(this.i18n.translate('notification.taskUpdated')))
        .catch(() => {
          // errorInterceptor already surfaced a snackbar for the failure.
        });
    });
  }

  private open(task: Task | null): Observable<CreateTaskDto | undefined> {
    const ref = this.dialog.open<TaskFormDialog, TaskFormDialogData, CreateTaskDto>(
      TaskFormDialog,
      {
        width: '560px',
        maxWidth: '92vw', // never forces horizontal scroll on a narrow phone
        data: { task, assignees: this.userStore.users() },
      },
    );
    return ref.afterClosed();
  }
}
