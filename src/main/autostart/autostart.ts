import { app } from 'electron'
import fs from 'fs'
import path from 'path'

function getAutostartPath(): string {
  return path.join(app.getPath('home'), '.config', 'autostart', 'timetracker.desktop')
}

export function isLinuxAutostartEnabled(): boolean {
  return fs.existsSync(getAutostartPath())
}

export function setLinuxAutostart(enabled: boolean): void {
  const autostartDir = path.join(app.getPath('home'), '.config', 'autostart')
  const desktopFilePath = getAutostartPath()

  if (enabled) {
    if (!fs.existsSync(autostartDir)) {
      fs.mkdirSync(autostartDir, { recursive: true })
    }
    const desktopEntry = `[Desktop Entry]
      Type=Application
      Name=TimeTracker
      Exec=${process.execPath}
      Hidden=false
      X-GNOME-Autostart-enabled=true
      Comment=Start TimeTracker automatically on login
      `
    fs.writeFileSync(desktopFilePath, desktopEntry)
  } else {
    if (fs.existsSync(desktopFilePath)) {
      fs.unlinkSync(desktopFilePath)
    }
  }
}

export function getLaunchOnStartup(): boolean {
  if (process.platform === 'linux') {
    return isLinuxAutostartEnabled()
  }
  return app.getLoginItemSettings().openAtLogin
}

export function setLaunchOnStartup(enabled: boolean): void {
  if (process.platform === 'linux') {
    setLinuxAutostart(enabled)
  } else {
    app.setLoginItemSettings({ openAtLogin: enabled, path: process.execPath })
  }
}
