import fs from 'fs'
import path from 'path'
import { app, ipcMain } from 'electron'
import { dialog } from 'electron'
import { getDb } from '../database'
import { ActivitiesRow } from '../../shared/databasetypes/ActivitiesRow'

export function IconHandlers() {
  const db = getDb()

  const iconsDir = path.join(app.getPath('userData'), 'icons')
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true })
  }

  ipcMain.handle('open-dialog', async (_, id: number) => {
    const res = await dialog.showOpenDialog({ properties: ['openFile'] })
    if (res.canceled) return null

    const pathToImage = res.filePaths[0]
    const filename = path.basename(pathToImage)
    const pathToSave = path.join(iconsDir, filename)

    try {
      const updateIcon = db.transaction((id: number) => {
        fs.copyFileSync(pathToImage, pathToSave)
        db.prepare('UPDATE activities SET iconLocation = ? WHERE id = ?').run(filename, id)
      })

      updateIcon(id)
    } catch (err) {
      console.log(err)
      // DB rolled back automatically — also clean up the file we just copied
      fs.existsSync(pathToSave) && fs.unlinkSync(pathToSave)
      throw err
    }

    return pathToSave
  })
}
