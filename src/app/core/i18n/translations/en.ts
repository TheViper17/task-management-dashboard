import type { TranslationDictionary } from '../translation.model';

/**
 * English — the primary language and the source of truth for the app's
 * translation key set. `ar.ts` is typed against `keyof typeof en`, so
 * adding a key here without adding it there is a compile error, not a
 * silently-missing Arabic string discovered at runtime.
 */
export const en = {
  'app.title': 'Task Manager',

  'nav.main': 'Main',
  'nav.dashboard': 'Dashboard',
  'nav.tasks': 'Tasks',
  'nav.calendar': 'Calendar',
  'nav.analytics': 'Analytics',
  'nav.team': 'Team',
  'nav.settings': 'Settings',
  'nav.skipToMainContent': 'Skip to main content',

  'common.newTask': 'New Task',
  'common.cancel': 'Cancel',
  'common.confirm': 'Confirm',
  'common.delete': 'Delete',
  'common.edit': 'Edit',
  'common.save': 'Save',
  'common.add': 'Add',
  'common.completed': 'Completed',

  'header.menuToggle': 'Toggle navigation menu',
  'header.searchPlaceholder': 'Search tasks...',
  'header.searchLabel': 'Search tasks',
  'header.notifications': 'Notifications',
  'header.language': 'Language',

  'dashboard.loadError': "Couldn't load your tasks. Please check your connection and try again.",
  'dashboard.retry': 'Retry',
  'dashboard.loadingBoard': 'Loading dashboard',

  'board.regionLabel': '{title} column',
  'board.empty': 'No tasks here.',

  'status.todo': 'To Do',
  'status.inProgress': 'In Progress',
  'status.done': 'Done',

  'toolbar.statusFilterLabel': 'Filter by status',
  'toolbar.statusAll': 'All',
  'toolbar.assigneeLabel': 'Assignee',
  'toolbar.assigneeAll': 'All Assignees',

  'priority.label': 'Priority',
  'priority.all': 'All Priorities',
  'priority.high': 'High',
  'priority.medium': 'Medium',
  'priority.low': 'Low',

  'task.moreActions': 'More actions for {title}',
  'task.titleFor': 'Title for {title}',
  'task.descriptionFor': 'Description for {title}',
  'task.unassigned': 'Unassigned',

  'dueDate.dueToday': 'Due today',
  'dueDate.dueTomorrow': 'Due tomorrow',
  'dueDate.dueInDays': { one: 'Due in {count} day', other: 'Due in {count} days' },
  'dueDate.overdueBy': { one: 'Overdue by {count} day', other: 'Overdue by {count} days' },
  'dueDate.completedToday': 'Completed today',
  'dueDate.completedYesterday': 'Completed yesterday',

  'taskForm.titleLabel': 'Title',
  'taskForm.titleRequired': 'Title is required.',
  'taskForm.titleMinLength': 'Title must be at least 3 characters.',
  'taskForm.titleMaxLength': "Title can't exceed 120 characters.",
  'taskForm.descriptionLabel': 'Description',
  'taskForm.descriptionRequired': 'Description is required.',
  'taskForm.descriptionMinLength': 'Description must be at least 10 characters.',
  'taskForm.descriptionMaxLength': "Description can't exceed 500 characters.",
  'taskForm.statusLabel': 'Status',
  'taskForm.dueDateLabel': 'Due date',
  'taskForm.dueDateRequired': 'Due date is required.',
  'taskForm.dueDatePast': "Due date can't be in the past.",
  'taskForm.assigneeRequired': 'Please choose an assignee.',
  'taskForm.tagsLegend': 'Tags',
  'taskForm.removeTag': 'Remove tag {tag}',
  'taskForm.addTagLabel': 'Add a tag',
  'taskForm.maxTags': 'You can add up to 5 tags.',
  'taskForm.createSubmit': 'Create Task',
  'taskForm.saveSubmit': 'Save Changes',

  'taskFormDialog.editTitle': 'Edit Task',
  'taskFormDialog.newTitle': 'New Task',

  'confirmDialog.deleteTitle': 'Delete task?',
  'confirmDialog.deleteMessage': 'Delete "{title}"? This can\'t be undone.',

  'notification.taskCreated': 'Task created.',
  'notification.taskUpdated': 'Task updated.',

  'error.network': 'Unable to reach the server. Check your connection and try again.',
  'error.notFound': 'The requested item could not be found.',
  'error.validation': 'The request was invalid.',
  'error.server': 'Something went wrong on the server. Please try again shortly.',
  'error.unknown': 'An unexpected error occurred.',

  'analytics.tasksByPriority': 'Tasks by Priority',
  'analytics.tasksByStatus': 'Tasks by Status',
  'analytics.recentActivity': 'Recent Activity',
  'analytics.chartSrItem': { one: '{label}: {count} task', other: '{label}: {count} tasks' },

  'activity.created': 'You created',
  'activity.updated': 'You updated',
  'activity.moved': 'You moved',
  'activity.completed': 'You completed',
  'activity.deleted': 'You deleted',
  'activity.empty': 'No recent activity.',

  'time.justNow': 'just now',
  'time.minutesAgo': { one: '{count} minute ago', other: '{count} minutes ago' },
  'time.hoursAgo': { one: '{count} hour ago', other: '{count} hours ago' },
  'time.daysAgo': { one: '{count} day ago', other: '{count} days ago' },
  'time.weeksAgo': { one: '{count} week ago', other: '{count} weeks ago' },

  'team.loading': 'Loading team…',
  'team.empty': 'No team members yet.',
  'team.taskCount': { one: '{count} task', other: '{count} tasks' },

  'placeholder.comingSoon': 'Coming soon.',
  'placeholder.notFoundTitle': 'Page not found',

  'stat.totalTasks': 'Total Tasks',
  'stat.overdue': 'Overdue',
  'stat.changeThisWeek': 'this week',
  'stat.changeToday': 'today',
  'stat.changeSameAsYesterday': 'Same as yesterday',
} as const satisfies TranslationDictionary;

export type TranslationKey = keyof typeof en;
