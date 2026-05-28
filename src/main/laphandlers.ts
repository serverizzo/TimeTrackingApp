import { ipcMain } from 'electron'
import { getDb } from './database'
import { LapRow } from '../shared/databasetypes/LapRow'

export function lapHandlers() {
  ipcMain.handle('insert-laps', (_, laps: LapRow[]) => {
    try {
      const db = getDb()

      const upsertCommand = db.prepare(`
      INSERT INTO laps (timestarted, date, lap_time, note, calendar, comments)
      VALUES (@timestarted, @date, @lapTime, @note, @calendarId, @comments)
      ON CONFLICT(timestarted, date) DO UPDATE SET
        lap_time   = excluded.lap_time,
        note       = excluded.note,
        calendar   = excluded.calendar,
        comments   = excluded.comments
    `)

      const upsertMany = db.transaction((laps: LapRow[]) => {
        for (const lap of laps) {
          upsertCommand.run(lap)
        }
      })

      upsertMany(laps)
      return { success: true }
    } catch (err) {
      console.log(err)
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
