#!/usr/bin/env node
/* eslint-disable */
/**
 * Data Generator (ported from the assignment's `data-fetching/generate-data.js`).
 *
 * Adapted so it can be consumed as a module by `scripts/seed-db.js`:
 *   - `generateStatistics()` and `generateTasks()` are exported
 *   - `main()` only runs when the file is executed directly
 *
 * The task/statistic content is unchanged from the assignment so that the
 * dataset the reviewers expect is preserved. Dates are always relative to
 * "today" at generation time.
 */

const fs = require('fs');
const path = require('path');

/** Add `days` to a date, returning a new Date. */
function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/** Format a date as `YYYY-MM-DD`. */
function formatDate(date) {
  return date.toISOString().split('T')[0];
}

/** Build the four dashboard statistics cards. */
function generateStatistics() {
  return {
    statistics: [
      {
        id: 'stat-001',
        title: 'Total Tasks',
        icon: '📊',
        value: 156,
        change: '+12',
        changeLabel: 'this week',
        changeType: 'positive',
        color: '#1976D2',
      },
      {
        id: 'stat-002',
        title: 'Completed',
        icon: '✅',
        value: 89,
        change: '+8',
        changeLabel: 'today',
        changeType: 'positive',
        color: '#388E3C',
      },
      {
        id: 'stat-003',
        title: 'In Progress',
        icon: '🔄',
        value: 42,
        change: '0',
        changeLabel: 'Same as yesterday',
        changeType: 'neutral',
        color: '#FF6F00',
      },
      {
        id: 'stat-004',
        title: 'Overdue',
        icon: '⚠️',
        value: 25,
        change: '+3',
        changeLabel: 'today',
        changeType: 'negative',
        color: '#D32F2F',
      },
    ],
    lastUpdated: new Date().toISOString(),
  };
}

/** Generate the task list with dates relative to today. */
function generateTasks() {
  const now = new Date();

  const tasks = [
    {
      id: 'task-001',
      title: 'Design new homepage layout',
      description:
        'Create wireframes and mockups for the new homepage redesign with modern UI elements',
      status: 'todo',
      priority: 'high',
      dueDate: formatDate(addDays(now, 2)),
      assignee: { id: 'user-001', name: 'John Doe', avatar: 'JD', email: 'john.doe@company.com' },
      tags: ['Design'],
      createdAt: addDays(now, -2).toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: 'task-002',
      title: 'Update documentation',
      description: 'Review and update API documentation for v2.0 release',
      status: 'todo',
      priority: 'medium',
      dueDate: formatDate(addDays(now, 5)),
      assignee: {
        id: 'user-002',
        name: 'Sarah Smith',
        avatar: 'SS',
        email: 'sarah.smith@company.com',
      },
      tags: ['Documentation'],
      createdAt: addDays(now, -3).toISOString(),
      updatedAt: addDays(now, -1).toISOString(),
    },
    {
      id: 'task-003',
      title: 'Organize team meeting',
      description: 'Schedule and prepare agenda for quarterly planning session',
      status: 'todo',
      priority: 'low',
      dueDate: formatDate(addDays(now, 7)),
      assignee: {
        id: 'user-003',
        name: 'Mike Johnson',
        avatar: 'MJ',
        email: 'mike.johnson@company.com',
      },
      tags: ['Admin'],
      createdAt: addDays(now, -4).toISOString(),
      updatedAt: addDays(now, -1).toISOString(),
    },
    {
      id: 'task-015',
      title: 'Prepare Q4 budget report',
      description: 'Compile and analyze financial data for quarterly budget presentation',
      status: 'todo',
      priority: 'high',
      dueDate: formatDate(addDays(now, -2)),
      isOverdue: true,
      assignee: {
        id: 'user-002',
        name: 'Sarah Smith',
        avatar: 'SS',
        email: 'sarah.smith@company.com',
      },
      tags: ['Finance'],
      createdAt: addDays(now, -16).toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: 'task-016',
      title: 'Review client feedback',
      description: 'Analyze customer feedback from user testing sessions',
      status: 'todo',
      priority: 'medium',
      dueDate: formatDate(addDays(now, -3)),
      isOverdue: true,
      assignee: {
        id: 'user-004',
        name: 'Emily Davis',
        avatar: 'ED',
        email: 'emily.davis@company.com',
      },
      tags: ['Research'],
      createdAt: addDays(now, -15).toISOString(),
      updatedAt: addDays(now, -1).toISOString(),
    },
    {
      id: 'task-004',
      title: 'Fix responsive design issues',
      description: 'Address layout problems on mobile and tablet devices',
      status: 'todo',
      priority: 'high',
      dueDate: formatDate(addDays(now, 3)),
      assignee: {
        id: 'user-004',
        name: 'Emily Davis',
        avatar: 'ED',
        email: 'emily.davis@company.com',
      },
      tags: ['Frontend'],
      createdAt: addDays(now, -5).toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: 'task-005',
      title: 'Implement user authentication',
      description: 'Add JWT-based authentication system with refresh tokens',
      status: 'in_progress',
      priority: 'high',
      dueDate: formatDate(addDays(now, 3)),
      assignee: { id: 'user-001', name: 'John Doe', avatar: 'JD', email: 'john.doe@company.com' },
      tags: ['Backend'],
      createdAt: addDays(now, -7).toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: 'task-006',
      title: 'Optimize database queries',
      description: 'Review and optimize slow queries identified in performance audit',
      status: 'in_progress',
      priority: 'medium',
      dueDate: formatDate(addDays(now, 4)),
      assignee: {
        id: 'user-002',
        name: 'Sarah Smith',
        avatar: 'SS',
        email: 'sarah.smith@company.com',
      },
      tags: ['Performance'],
      createdAt: addDays(now, -6).toISOString(),
      updatedAt: addDays(now, -1).toISOString(),
    },
    {
      id: 'task-007',
      title: 'Create API endpoints',
      description: 'Develop RESTful API endpoints for task management features',
      status: 'in_progress',
      priority: 'high',
      dueDate: formatDate(addDays(now, 2)),
      assignee: {
        id: 'user-003',
        name: 'Mike Johnson',
        avatar: 'MJ',
        email: 'mike.johnson@company.com',
      },
      tags: ['Backend'],
      createdAt: addDays(now, -8).toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: 'task-008',
      title: 'Add dark mode support',
      description: 'Implement theme toggle with dark/light mode preferences',
      status: 'in_progress',
      priority: 'medium',
      dueDate: formatDate(addDays(now, 6)),
      assignee: {
        id: 'user-004',
        name: 'Emily Davis',
        avatar: 'ED',
        email: 'emily.davis@company.com',
      },
      tags: ['Frontend'],
      createdAt: addDays(now, -9).toISOString(),
      updatedAt: addDays(now, -1).toISOString(),
    },
    {
      id: 'task-017',
      title: 'Update payment gateway integration',
      description: 'Migrate to new payment provider API and update billing logic',
      status: 'in_progress',
      priority: 'high',
      dueDate: formatDate(addDays(now, -1)),
      isOverdue: true,
      assignee: { id: 'user-001', name: 'John Doe', avatar: 'JD', email: 'john.doe@company.com' },
      tags: ['Backend', 'Critical'],
      createdAt: addDays(now, -14).toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: 'task-009',
      title: 'Fix critical login bug',
      description: 'Resolved issue preventing users from logging in on mobile devices',
      status: 'done',
      priority: 'high',
      dueDate: formatDate(addDays(now, -1)),
      completedAt: now.toISOString(),
      assignee: {
        id: 'user-003',
        name: 'Mike Johnson',
        avatar: 'MJ',
        email: 'mike.johnson@company.com',
      },
      tags: ['Bug Fix'],
      createdAt: addDays(now, -2).toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: 'task-010',
      title: 'Setup CI/CD pipeline',
      description: 'Configured GitHub Actions for automated testing and deployment',
      status: 'done',
      priority: 'medium',
      dueDate: formatDate(addDays(now, -2)),
      completedAt: addDays(now, -1).toISOString(),
      assignee: { id: 'user-001', name: 'John Doe', avatar: 'JD', email: 'john.doe@company.com' },
      tags: ['DevOps'],
      createdAt: addDays(now, -9).toISOString(),
      updatedAt: addDays(now, -1).toISOString(),
    },
    {
      id: 'task-011',
      title: 'Write unit tests',
      description: 'Add comprehensive unit tests for authentication module',
      status: 'done',
      priority: 'high',
      dueDate: formatDate(addDays(now, -3)),
      completedAt: addDays(now, -2).toISOString(),
      assignee: {
        id: 'user-002',
        name: 'Sarah Smith',
        avatar: 'SS',
        email: 'sarah.smith@company.com',
      },
      tags: ['Testing'],
      createdAt: addDays(now, -10).toISOString(),
      updatedAt: addDays(now, -2).toISOString(),
    },
    {
      id: 'task-012',
      title: 'Refactor payment module',
      description: 'Clean up and optimize payment processing code',
      status: 'done',
      priority: 'medium',
      dueDate: formatDate(addDays(now, -4)),
      completedAt: addDays(now, -3).toISOString(),
      assignee: {
        id: 'user-004',
        name: 'Emily Davis',
        avatar: 'ED',
        email: 'emily.davis@company.com',
      },
      tags: ['Refactoring'],
      createdAt: addDays(now, -12).toISOString(),
      updatedAt: addDays(now, -3).toISOString(),
    },
    {
      id: 'task-013',
      title: 'Security audit',
      description: 'Conduct comprehensive security review of the application',
      status: 'done',
      priority: 'high',
      dueDate: formatDate(addDays(now, -5)),
      completedAt: addDays(now, -4).toISOString(),
      assignee: { id: 'user-001', name: 'John Doe', avatar: 'JD', email: 'john.doe@company.com' },
      tags: ['Security'],
      createdAt: addDays(now, -13).toISOString(),
      updatedAt: addDays(now, -4).toISOString(),
    },
    {
      id: 'task-014',
      title: 'Update dependencies',
      description: 'Update all npm packages to latest stable versions',
      status: 'done',
      priority: 'low',
      dueDate: formatDate(addDays(now, -6)),
      completedAt: addDays(now, -5).toISOString(),
      assignee: {
        id: 'user-003',
        name: 'Mike Johnson',
        avatar: 'MJ',
        email: 'mike.johnson@company.com',
      },
      tags: ['Maintenance'],
      createdAt: addDays(now, -14).toISOString(),
      updatedAt: addDays(now, -5).toISOString(),
    },
  ];

  return { tasks, meta: { totalCount: tasks.length, lastUpdated: now.toISOString() } };
}

function writeJsonFile(filename, data) {
  const filePath = path.join(__dirname, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`✅ Generated: ${filename}`);
}

function main() {
  console.log('🚀 Generating fresh data with dynamic dates...\n');
  writeJsonFile('statistics.json', generateStatistics());
  writeJsonFile('tasks.json', generateTasks());
  console.log('\n✨ Done.');
}

module.exports = { addDays, formatDate, generateStatistics, generateTasks };

if (require.main === module) {
  main();
}
