import fs from 'fs'
import path from 'path'
import { app } from 'electron'

export const createIconDirectory = () => {
  const iconsDir = path.join(app.getPath('userData'), 'icons')
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true })
  }
}
