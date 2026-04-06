import Database from 'better-sqlite3'
import { app } from 'electron'
import path from 'path'
import BetterSqlite3 from 'better-sqlite3'

let db: BetterSqlite3.Database

export function initializeDatabase(): void {
  // Get the correct user data directory for the platform
  const dbPath = path.join(app.getPath('userData'), 'timetracker.db')

  // Create or open the database
  db = new Database(dbPath)

  // Enable WAL mode for better performance
  db.pragma('journal_mode = WAL')

  // Create the laps table if it doesn't exist
  db.exec(`
        CREATE TABLE IF NOT EXISTS laps (
            timestarted       TEXT NOT NULL,
            date              TEXT NOT NULL,
            lap_time          INTEGER,
            cumulative_total  INTEGER,
            note              TEXT,
            PRIMARY KEY (timestarted, date)
            )
            `)

  db.exec(`
        CREATE TABLE IF NOT EXISTS daily_activity (
            date              TEXT NOT NULL,
            activity_id       INTERGER NOT NULL,
            PRIMARY KEY (date, activity_id),
            FOREIGN KEY (activity_id) REFERENCES activies(id)
            )
            `)

  // Create the laps table if it doesn't exist
  db.exec(`
        CREATE TABLE IF NOT EXISTS activities (
            id        INTEGER PRIMARY KEY AUTOINCREMENT,
            name      TEXT NOT NULL UNIQUE,
            iconLocation      TEXT
            )
            `)
}

export function getDb(): BetterSqlite3.Database {
  return db
}
