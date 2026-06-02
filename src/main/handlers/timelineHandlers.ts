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

        lapsByDay AS (
          SELECT l.date, l.timestarted, 
          json_group_array(
            json_object('timestarted',l.timestarted, 'note', l.note, 'lap_time', l.lap_time, 'calendarcolor', c.color, 'calendarname', c.name)
          ) AS laparray
          FROM laps l
          LEFT JOIN calendars c
          ON l.calendar = c.id
          GROUP BY l.date
        )

        SELECT lbd.date, lbd.laparray, idt.activities
        FROM lapsByDay lbd
        LEFT JOIN iconDateTable idt
        ON lbd.date = idt.date
        `
      )
      .all()
      .map((row: any) => ({
        ...row,
        activities: JSON.parse(row.activities),
        laparray: JSON.parse(row.laparray)
      }))

    return rows
  })
}
