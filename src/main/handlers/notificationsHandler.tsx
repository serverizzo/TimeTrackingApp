import { ipcMain, BrowserWindow, Notification } from 'electron'

let alarmTimeout: NodeJS.Timeout | null = null
let nextAlarmTime: number | null = null
let isTimerEnabled: boolean = false

export function registerNotificationsHandler(): void {
  function scheduleAlarm(timeInMilliseconds: number): void {
    nextAlarmTime = Date.now() + timeInMilliseconds

    alarmTimeout = setTimeout(() => {
      const win = BrowserWindow.getAllWindows()[0]
      console.log('flash triggered, window:', win?.id)
      win?.flashFrame(true)
      new Notification({
        title: 'TimeTracker',
        body: 'Your timer has been running for x minutes'
      }).show()
      scheduleAlarm(timeInMilliseconds) // reschedule the alarm
    }, timeInMilliseconds)
  }

  ipcMain.handle('flash-window', (_, timeInMilliseconds: number) => {
    console.log(`timeInMilliseconds: ${timeInMilliseconds}`)

    scheduleAlarm(timeInMilliseconds)
    isTimerEnabled = true

    return new Date(nextAlarmTime).toLocaleTimeString()
  })

  ipcMain.handle('get-next-notification-time', () => {
    if (nextAlarmTime) {
      return new Date(nextAlarmTime).toLocaleTimeString()
    }
  })

  ipcMain.handle('disable-repeat-notification', () => {
    if (alarmTimeout) {
      clearTimeout(alarmTimeout)
      isTimerEnabled = false
    }
  })
}
