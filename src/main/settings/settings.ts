import { app } from 'electron'
import { join } from 'path'
import { readFileSync, writeFileSync, existsSync } from 'fs'

const settingsPath = join(app.getPath('userData'), 'settings.json')

interface Settings {
  alarmInterval: number | null
}

const defaultSettings: Settings = {
  alarmInterval: null
}

export function loadSettings(): Settings {
  if (!existsSync(settingsPath)) return defaultSettings
  const raw = readFileSync(settingsPath, 'utf-8')
  return JSON.parse(raw)
}

export function saveSettings(newSettings: Settings): void {
  const current = loadSettings()
  const merged = { ...current, ...newSettings }
  writeFileSync(settingsPath, JSON.stringify(merged, null, 2))
}
