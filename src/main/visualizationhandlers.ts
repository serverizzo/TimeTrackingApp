import { ipcMain } from 'electron'
import { getDb } from './database'

export function visualizationhandlers() {
  // Heatmap — aggregated daily totals for the past year
  ipcMain.handle('get-heatmap-data', () => {
    const db = getDb()
    const heatmapDataByDayAndCalendarArr = db
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

    const checkinItemByDayArr = db
      .prepare(
        `
        SELECT da.date, a.id, a.name, a.iconLocation
        FROM daily_activities da
        JOIN activities a ON a.id = da.activity_id
      `
      )
      .all()

    return { heatmapDataByDayAndCalendarArr, checkinItemByDayArr }
  })

  // Gantt — all laps for a 7 day window
  ipcMain.handle('get-laps-by-range', (_, startDate: string, endDate: string) => {
    const db = getDb()
    return db
      .prepare(
        `
        SELECT timestarted, date, lap_time, note, comments
        FROM laps
        WHERE date BETWEEN ? AND ?
        ORDER BY date, timestarted
      `
      )
      .all(startDate, endDate)
  })

  // Linechart
  // TODO: update this to get a range of data
  ipcMain.handle('get-linechart-data', (_, startDate: string | null) => {
    const db = getDb()

    if (!startDate) {
      return db
        .prepare(
          `
      SELECT l.date, l.note, c.name as calendarName, c.color as calendarColor, l.lap_time
      FROM laps l
      LEFT JOIN calendars c 
      ON l.calendar = c.id
    `
        )
        .all()
    }

    return db
      .prepare(
        `
    SELECT l.date, l.note, c.name as calendarName, c.color as calendarColor, l.lap_time
    FROM laps l
    LEFT JOIN calendars c 
    ON l.calendar = c.id 
    WHERE l.date >= ?
  `
      )
      .all(startDate)
  })
}
