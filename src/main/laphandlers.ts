import { ipcMain } from 'electron'
import { getDb } from './database'
import { LapRow } from '../shared/databasetypes/LapRow'

export function lapHandlers() {
  ipcMain.handle('insert-laps', (_, laps: LapRow[]) => {
    try {
      const db = getDb()

      const insertCommand = db.prepare(`
            INSERT OR IGNORE INTO laps (timestarted, date, lap_time, note)
            VALUES (@timestarted, @date, @lapTime, @note)
            `)

      const insertMany = db.transaction((laps) => {
        for (const lap of laps) {
          insertCommand.run(lap)
        }
      })

      insertMany(laps)
      return { success: true }
    } catch {
      throw new Error('failed to save laps')
    }
  })

  ipcMain.handle('update-lap', (_, timeStarted, date, note) => {
    const db = getDb()
    db.prepare(
      `UPDATE laps
      SET note = ?
      WHERE timestarted = ? 
      AND date = ?`
    ).run(note, timeStarted, date)
  })
}
