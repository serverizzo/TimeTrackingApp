import fs from 'fs'
import path from 'path'
import { app } from 'electron'

export const createNotesFile = () => {
  const notesDir = path.join(app.getPath('userData'), 'notes')
  if (!fs.existsSync(notesDir)) {
    fs.mkdirSync(notesDir, { recursive: true })
  }

  const currentYear = new Date().getFullYear()
  const notesPath = path.join(notesDir, `${currentYear}.md`)
  if (!fs.existsSync(notesPath)) {
    fs.writeFileSync(notesPath, `# ${currentYear} Journal\n`)
  }
}
