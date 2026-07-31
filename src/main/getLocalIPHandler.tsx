import os from 'os'
import { ipcMain } from 'electron'

export function registerQRCodeHandler(): void {
  ipcMain.handle('get-local-ip', () => {
    const interfaces = os.networkInterfaces()
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name] ?? []) {
        if (iface.family === 'IPv4' && !iface.internal) {
          return iface.address
        }
      }
    }
    return null
  })
}
