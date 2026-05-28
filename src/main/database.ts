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
            source            TEXT, 
            calendar          INTEGER, 
            comments          TEXT,
            PRIMARY KEY (timestarted, date),
            FOREIGN KEY (calendar) REFERENCES calendars(id)
            )
            `)

  // Create the laps table if it doesn't exist
  db.exec(`
        CREATE TABLE IF NOT EXISTS activities (
            id        INTEGER PRIMARY KEY AUTOINCREMENT,
            name      TEXT NOT NULL UNIQUE,
            iconLocation      TEXT,
            isTrackedInLaps   INTERGER,
            calendar          TEXT,
            isTrackedInCheckin  INTERGER
            )
            `)

  // TODO: insert a default row for default calandars (so that laps without calandars will appear on the heatmap)
  db.exec(`
      CREATE TABLE IF NOT EXISTS calendars (
        id    INTEGER PRIMARY KEY AUTOINCREMENT,
        name      TEXT NOT NULL UNIQUE,
        color     TEXT
      )
    `)

  // add defualt "Uncategorized" calendar
  db.exec(`
    INSERT OR IGNORE INTO calendars (id, name, color)
    VALUES (-1, 'Uncategorized', '#00FF00')
  `)
}

export function getDb(): BetterSqlite3.Database {
  return db
}
