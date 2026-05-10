import { ipcMain } from 'electron'
import { getDb } from '../database'

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
}
