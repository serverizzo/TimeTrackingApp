import { ipcMain } from 'electron'
import { getDb } from './database'
import { ActivitiesRow } from '../shared/databasetypes/ActivitiesRow'

export function activityhandlers() {
  ipcMain.handle('get-activities', (_) => {
    const db = getDb()
    return db
      .prepare(
        `
        SELECT id, name, iconLocation, isTrackedInLaps, calendar, isTrackedInCheckin
        FROM activities
        ORDER BY name
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

  ipcMain.handle('update-or-insert-activity', (_, activities: ActivitiesRow[]) => {
    const db = getDb()

    const upsert = db.prepare(`
    INSERT INTO activities (id, name, iconLocation, isTrackedInLaps, calendar, isTrackedInCheckin)
    VALUES (@id, @name, @iconLocation, @isTrackedInLaps, @calendar, @isTrackedInCheckin)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      iconLocation = excluded.iconLocation,
      isTrackedInLaps = excluded.isTrackedInLaps,
      calendar = excluded.calendar,
      isTrackedInCheckin = excluded.isTrackedInCheckin
  `)

    const upsertMany = db.transaction((rows: ActivitiesRow[]) => {
      for (const row of rows) {
        upsert.run(row)
      }
    })

    upsertMany(activities)
  })
}
