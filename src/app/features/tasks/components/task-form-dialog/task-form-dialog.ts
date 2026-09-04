import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { TranslatePipe } from '../../../../core/i18n/translate.pipe';
import type { Assignee, CreateTaskDto, Task } from '../../../../core/models/task.model';
import { TaskForm } from '../task-form/task-form';

export interface TaskFormDialogData {
  task: Task | null;
  assignees: readonly Assignee[];
}

/** Thin dialog host around `TaskForm` — title text + wiring save/cancel to `MatDialogRef`. */
@Component({
  selector: 'app-task-form-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatDialogModule, TaskForm, TranslatePipe],
  templateUrl: './task-form-dialog.html',
})
export class TaskFormDialog {
  protected readonly data = inject<TaskFormDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<TaskFormDialog, CreateTaskDto>);

  protected onSave(dto: CreateTaskDto): void {
    this.dialogRef.close(dto);
  }

  protected onCancel(): void {
    this.dialogRef.close();
  }
}
