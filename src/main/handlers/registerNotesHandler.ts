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

  ipcMain.handle('save-notes', (_, content: string) => {
    const currentYear = new Date().getFullYear()
    const notesPath = path.join(app.getPath('userData'), 'notes', `${currentYear}.md`)
    fs.writeFileSync(notesPath, content, 'utf-8')
  })

  ipcMain.handle('save-draft', (_, content: string) => {
    const currentYear = new Date().getFullYear()
    const notesPath = path.join(app.getPath('userData'), 'notes', `${currentYear}.draft.md`)
    fs.writeFileSync(notesPath, content, 'utf-8')
  })

  ipcMain.handle('get-draft', () => {
    const currentYear = new Date().getFullYear()
    const notesPath = path.join(app.getPath('userData'), 'notes', `${currentYear}.draft.md`)
    if (!fs.existsSync(notesPath)) return ''
    return fs.readFileSync(notesPath, 'utf-8')
  })

  ipcMain.handle('delete-draft', () => {
    const currentYear = new Date().getFullYear()
    const draftPath = path.join(app.getPath('userData'), 'notes', `${currentYear}.draft.md`)
    if (fs.existsSync(draftPath)) fs.unlinkSync(draftPath)
  })
}
