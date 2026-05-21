import { ipcMain } from 'electron'
import { getDb } from './database'
import { ActivitiesRow } from '../shared/databasetypes/ActivitiesRow'

export function activityhandlers() {
  ipcMain.handle('get-activities', (_) => {
    const db = getDb()
    return db
      .prepare(
        `
        SELECT a.id, a.name, a.iconLocation, a.isTrackedInLaps, 
        COALESCE(c.name, 'Uncategorized') AS calendar, a.isTrackedInCheckin
        FROM activities a
        LEFT JOIN calendars c ON a.calendar = c.id
        ORDER BY a.name
      `
      )
      .all()
  })

  ipcMain.handle('get-checked-activities', (_, date) => {
    const db = getDb()
    return db
      .prepare(
        `
          SELECT a.name, a.id,
            CASE WHEN da.activity_id IS NOT NULL then 1 ELSE 0 END as isChecked
          FROM activities a
          LEFT JOIN daily_activities da
            ON a.id = da.activity_id
            AND da.date = ?
          WHERE a.isTrackedInCheckin = 1
          ORDER BY a.name
        `
      )
      .all(date)
  })

  ipcMain.handle(
    'update-checkins',
    (_, date: string, checkList: { id: number; isChecked: boolean }[]) => {
      const db = getDb()

      const insert = db.prepare(`
            INSERT OR IGNORE INTO daily_activities (date, activity_id)
            VALUES (?, ?)
          `)

      const deleteFunc = db.prepare(`
            DELETE FROM daily_activities 
            WHERE date = ? AND activity_id = ?
          `)

      const insertOrDelete = db.transaction((listToRun: { id: number; isChecked: boolean }[]) => {
        for (const ele of listToRun) {
          // if checked, add to db
          if (ele.isChecked) insert.run(date, ele.id)
          // otherwise remove from db
          else deleteFunc.run(date, ele.id)
        }
      })

      insertOrDelete(checkList)
    }
  )

  ipcMain.handle('get-checked-activities-by-month', (_, dateStart: string, dateEnd: string) => {
    const db = getDb()

    return db
      .prepare(
        `
          SELECT da.date, a.id, a.name, a.iconLocation
          FROM activities a
          JOIN daily_activities da
          ON a.id = da.activity_id
          WHERE da.date BETWEEN ? AND ?
          ORDER BY da.date
          `
      )
      .all(dateStart, dateEnd)
  })

  ipcMain.handle('insert-new-activity', (_) => {
    const db = getDb()
    return db
      .prepare(
        `
        INSERT INTO activities (name, iconLocation, isTrackedInLaps, isTrackedInCheckin, calendar) 
        VALUES ('new_activity', NULL, 0, 0, NULL)
      `
      )
      .run()
  })

  ipcMain.handle('update-activity', (_, rows: ActivitiesRow[]) => {
    const db = getDb()
    const update = db.prepare(`
      UPDATE activities 
      SET name = @name, 
        iconLocation = @iconLocation, 
        isTrackedInLaps = @isTrackedInLaps, 
        isTrackedInCheckin = @isTrackedInCheckin, 
        calendar = (SELECT id FROM calendars WHERE name = @calendar)
      WHERE id = @id  
      `)

    for (const { id, name, iconLocation, isTrackedInLaps, isTrackedInCheckin, calendar } of rows) {
      update.run({ id, name, iconLocation, isTrackedInLaps, isTrackedInCheckin, calendar })
    }
  })

  ipcMain.handle('remove-activity', (_, id: number) => {
    const db = getDb()
    db.prepare(
      `
      DELETE FROM activities WHERE id=@id
      `
    ).run({ id: id })
  })
}
