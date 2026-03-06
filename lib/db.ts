import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = process.env.DATA_DIR
  ? path.join(process.env.DATA_DIR, 'chores.db')
  : path.join(process.cwd(), 'chores.db');

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    initTables(db);
  }
  return db;
}

function initTables(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      color TEXT NOT NULL DEFAULT '#6366f1',
      total_points INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS chores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      frequency TEXT NOT NULL CHECK(frequency IN ('daily','weekly','monthly')),
      member_id INTEGER REFERENCES members(id) ON DELETE SET NULL,
      points INTEGER NOT NULL DEFAULT 5,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS completions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      chore_id INTEGER NOT NULL REFERENCES chores(id) ON DELETE CASCADE,
      member_id INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
      completed_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // Seed example data if empty
  const memberCount = (db.prepare('SELECT COUNT(*) as c FROM members').get() as { c: number }).c;
  if (memberCount === 0) {
    const insertMember = db.prepare('INSERT INTO members (name, color) VALUES (?, ?)');
    insertMember.run('Alice', '#f43f5e');
    insertMember.run('Bob', '#3b82f6');
    insertMember.run('Charlie', '#22c55e');

    const insertChore = db.prepare(
      'INSERT INTO chores (title, frequency, member_id, points) VALUES (?, ?, ?, ?)'
    );
    insertChore.run('Clean kitchen', 'daily', 1, 5);
    insertChore.run('Take out trash', 'daily', 2, 5);
    insertChore.run('Vacuum living room', 'weekly', 1, 10);
    insertChore.run('Clean bathrooms', 'weekly', 3, 10);
    insertChore.run('Mow the lawn', 'monthly', 2, 20);
    insertChore.run('Clean windows', 'monthly', null, 20);
  }
}
