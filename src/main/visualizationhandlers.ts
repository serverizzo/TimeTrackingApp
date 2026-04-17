import { ipcMain } from 'electron'
import { getDb } from './database'

export function visualizationhandlers() {
  // Heatmap — aggregated daily totals for the past year
  ipcMain.handle('get-heatmap-data', () => {
    const db = getDb()
    return db
      .prepare(
        `
        SELECT date, SUM(lap_time) as total
        FROM laps
        WHERE date >= date('now', '-1 year')
        GROUP BY date
        ORDER BY date
      `
      )
      .all()
  })

  // Gantt — all laps for a 7 day window
  ipcMain.handle('get-laps-by-range', (_, startDate: string, endDate: string) => {
    const db = getDb()
    return db
      .prepare(
        `
        SELECT timestarted, date, lap_time, note
        FROM laps
        WHERE date BETWEEN ? AND ?
        ORDER BY date, timestarted
      `
      )
      .all(startDate, endDate)
  })
}
