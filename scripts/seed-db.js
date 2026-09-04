#!/usr/bin/env node
/* eslint-disable */
/**
 * Seed script for the json-server mock backend.
 *
 * Transforms the assignment dataset (see ./generate-data.js) into the flat
 * shape json-server expects and writes it to `mock-api/db.json`:
 *
 *   {
 *     "tasks":      Task[],              // GET /api/tasks
 *     "users":      Assignee[],          // GET /api/users
 *     "statistics": StatisticsResponse   // GET /api/statistics
 *   }
 *
 * Transformations applied to each task:
 *   - `assigneeId` added alongside the embedded `assignee` (relational + convenient)
 *   - `isOverdue` normalised for every task (dueDate < today && status !== 'done')
 *   - `order` added per status column so the board has a stable sort key
 *
 * Run before committing / submitting:  npm run db:reset
 */

const fs = require('fs');
const path = require('path');
const { generateTasks, generateStatistics } = require('./generate-data');

const OUT_FILE = path.join(__dirname, '..', 'mock-api', 'db.json');

/** True when a task's due date is in the past and it is not done. */
function computeIsOverdue(task) {
  if (task.status === 'done') return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(task.dueDate);
  due.setHours(0, 0, 0, 0);
  return due < today;
}

function buildDb() {
  const { tasks } = generateTasks();
  const statistics = generateStatistics();

  // Per-column running index -> stable `order` field.
  const orderByStatus = { todo: 0, in_progress: 0, done: 0 };

  const normalisedTasks = tasks.map((task) => ({
    ...task,
    assigneeId: task.assignee.id,
    isOverdue: computeIsOverdue(task),
    order: orderByStatus[task.status]++,
  }));

  // Unique assignees -> users collection.
  const users = Object.values(
    normalisedTasks.reduce((acc, { assignee }) => {
      acc[assignee.id] = assignee;
      return acc;
    }, {}),
  ).sort((a, b) => a.name.localeCompare(b.name));

  return { tasks: normalisedTasks, users, statistics };
}

function main() {
  const db = buildDb();
  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify(db, null, 2) + '\n', 'utf8');

  console.log('✅ Seeded mock-api/db.json');
  console.log(`   tasks:      ${db.tasks.length}`);
  console.log(`   users:      ${db.users.length}`);
  console.log(`   statistics: ${db.statistics.statistics.length} cards`);
  console.log(`   overdue:    ${db.tasks.filter((t) => t.isOverdue).length}`);
}

main();
