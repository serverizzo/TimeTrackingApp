import { ipcMain } from 'electron'
import { getDb } from '../database'

export function registerTimelineHandlers() {
  ipcMain.handle('get-timeline-data', async (_) => {
    const db = getDb()
    const rows = db
      .prepare(
        `
        WITH iconDateTable AS(
            SELECT da.date, 
            json_group_array(
                json_object('location', a.iconLocation, 'icon_name', a.name)
            ) as activities
            FROM daily_activities da
            JOIN activities a
            ON a.id = da.activity_id 
            GROUP BY date
            ORDER BY date
        ),

        lapColor AS(
            SELECT c.color, l.timestarted, l.date, c.name as calendar_name
            FROM calendars c
            JOIN laps l 
            ON l.calendar = c.id 
        )

        SELECT l.timestarted, l.date, it.activities, l.note, l.lap_time, lc.color, lc.calendar_name
        FROM laps l 
        LEFT JOIN lapColor lc on l.timestarted = lc.timestarted and l.date = lc.date
        LEFT JOIN iconDateTable it on l.date = it.date
        `
      )
      .all()

    return rows
  })
}
