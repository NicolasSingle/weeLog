import Database from '@tauri-apps/plugin-sql'

let db: Database | null = null

export async function initDb(): Promise<Database> {
  if (db) return db
  db = await Database.load('sqlite:suji_data.db')

  await db.execute(`
    CREATE TABLE IF NOT EXISTS todos (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      due_date TEXT,
      priority TEXT DEFAULT 'medium',
      status TEXT DEFAULT 'pending',
      tags TEXT DEFAULT '[]',
      sort_order INTEGER DEFAULT 0,
      archived INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      completed_at TEXT
    )
  `)

  // Migration: add new columns if they don't exist
  try {
    await db.execute('ALTER TABLE todos ADD COLUMN sort_order INTEGER DEFAULT 0')
  } catch { /* column already exists */ }
  try {
    await db.execute('ALTER TABLE todos ADD COLUMN archived INTEGER DEFAULT 0')
  } catch { /* column already exists */ }

  await db.execute(`
    CREATE TABLE IF NOT EXISTS reports (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL UNIQUE,
      content TEXT NOT NULL,
      tags TEXT DEFAULT '[]',
      todos TEXT DEFAULT '[]',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `)

  return db
}

export { db }
