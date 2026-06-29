import { ipcMain, BrowserWindow, Notification } from 'electron'

let timeUntilNextNotification = new Date()

export function registerNotificationsHandler(): void {
  ipcMain.handle('flash-window', (_, timeInMilliseconds: number) => {
    console.log(`timeInMilliseconds: ${timeInMilliseconds}`)
    setTimeout(() => {
      const win = BrowserWindow.getAllWindows()[0]
      console.log('flash triggered, window:', win?.id)
      win?.flashFrame(true)
      new Notification({
        title: 'TimeTracker',
        body: 'Your timer has been running for x minutes'
      }).show()
    }, timeInMilliseconds)
  })
}
