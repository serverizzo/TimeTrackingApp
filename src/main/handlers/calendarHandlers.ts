import { ipcMain } from 'electron'
import { getDb } from '../database'
import { CalendarRows } from '../../shared/databasetypes/calendarRows'

export function registerCalendarHandlers() {
  ipcMain.handle('get-calendars', (_) => {
    const db = getDb()
    return db
      .prepare(
        `
        SELECT id, name, color
        FROM calendars
      `
      )
      .all()
  })

  ipcMain.handle('insert-new-calendar', (_) => {
    const db = getDb()
    return db
      .prepare(
        `
        INSERT INTO calendars(name, color) values ('new_calendar', '#6F2DA8')
      `
      )
      .run()
  })

  ipcMain.handle('update-calendar', (_, calandarRows: CalendarRows[]) => {
    const db = getDb()

    const update = db.prepare(`
      UPDATE calendars SET name = @name, color = @color
      WHERE id = @id
      `)

    for (const { id, name, color } of calandarRows) {
      update.run({ id, name, color })
    }
  })
}
