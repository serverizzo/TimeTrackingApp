import { ipcMain, safeStorage, app } from 'electron'
import fs from 'fs'
import path from 'path'

const tokenPath = path.join(app.getPath('userData'), 'auth.token')

export function registerAuthHandlers() {
  ipcMain.handle('get-token', () => {
    try {
      if (!fs.existsSync(tokenPath)) return null
      const encrypted = fs.readFileSync(tokenPath)
      return safeStorage.decryptString(encrypted)
    } catch {
      return null
    }
  })

  ipcMain.handle('save-token', (_, token: string) => {
    try {
      const encrypted = safeStorage.encryptString(token)
      fs.writeFileSync(tokenPath, encrypted)
      return { success: true }
    } catch (error) {
      return { success: false }
    }
  })

  ipcMain.handle('delete-token', () => {
    try {
      if (fs.existsSync(tokenPath)) fs.unlinkSync(tokenPath)
      return { success: true }
    } catch {
      return { success: false }
    }
  })
}
