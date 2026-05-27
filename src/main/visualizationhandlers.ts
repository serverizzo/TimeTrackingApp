import { ipcMain } from 'electron'
import { getDb } from './database'

export function visualizationhandlers() {
  // Heatmap — aggregated daily totals for the past year
  ipcMain.handle('get-heatmap-data', () => {
    const db = getDb()
    return db
      .prepare(
        `
        SELECT
          date,
          json_group_array(
            json_object('note', note, 'lap_time', lap_time)
          ) AS laps,
          calendar_name,
          SUM(lap_time) AS total,
          color
        FROM (
          SELECT
            l.date,
            l.note,
            COALESCE(direct_c.name, activity_c.name, 'Uncategorized') AS calendar_name,
            SUM(l.lap_time) AS lap_time,
            COALESCE(direct_c.color, activity_c.color) AS color
          FROM laps l
          LEFT JOIN calendars direct_c ON l.calendar = direct_c.id
          LEFT JOIN activities a ON l.note = a.name AND l.calendar IS NULL
          LEFT JOIN calendars activity_c ON a.calendar = activity_c.id
          WHERE l.date >= date('now', '-1 year')
          GROUP BY l.date, l.note, COALESCE(direct_c.name, activity_c.name, 'Uncategorized')
        )
        GROUP BY date, calendar_name
        ORDER BY date
      `
      )
      .all()
      .map((row: any) => ({
        ...row,
        laps: JSON.parse(row.laps)
      }))
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
