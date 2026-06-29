import { ipcMain, BrowserWindow, Notification } from 'electron'

export function registerNotificationsHandler(): void {
  ipcMain.handle('flash-window', () => {
    setTimeout(() => {
      const win = BrowserWindow.getAllWindows()[0]
      console.log('flash triggered, window:', win?.id)
      win?.flashFrame(true)
      new Notification({
        title: 'TimeTracker',
        body: 'Your timer has been running for x minutes'
      }).show()
    }, 3000)
  })
}
