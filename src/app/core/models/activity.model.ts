/**
 * Recent-activity feed domain model.
 *
 * The mock API has no activity collection, so `ActivityStore` synthesises
 * this feed client-side: it seeds from the most recently updated tasks and
 * appends an entry whenever `TaskStore` completes a command. See
 * core/stores/activity.store.ts for the full rationale.
 */
export type ActivityType = 'created' | 'updated' | 'moved' | 'completed' | 'deleted';

export interface ActivityEntry {
  id: string;
  type: ActivityType;
  taskId: string;
  taskTitle: string;
  detail?: string;
  at: string; // ISO datetime
}
