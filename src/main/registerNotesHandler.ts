import { app, ipcMain } from 'electron'
import fs from 'fs'
import path from 'path'

export function registerNotesHandlers() {
  ipcMain.handle('get-notes', () => {
    const currentYear = new Date().getFullYear()
    const notesPath = path.join(app.getPath('userData'), 'notes', `${currentYear}.md`)

    if (!fs.existsSync(notesPath)) return ''

    return fs.readFileSync(notesPath, 'utf-8')
  })
}
