import { ipcMain, BrowserWindow, Notification } from 'electron'
import { loadSettings, saveSettings } from '../settings/settings'

let alarmTimeout: NodeJS.Timeout | null = null
let nextAlarmTime: number | null = null
let alarmInterval: number | null = null

export function registerNotificationsHandler(): void {
  // Restore alarm on startup
  const settings = loadSettings()
  if (settings.alarmInterval) {
    alarmInterval = settings.alarmInterval
    scheduleAlarm(alarmInterval)
  }

  function scheduleAlarm(timeInMilliseconds: number): void {
    nextAlarmTime = Date.now() + timeInMilliseconds

    alarmTimeout = setTimeout(() => {
      const win = BrowserWindow.getAllWindows()[0]
      // console.log('flash triggered, window:', win?.id)
      win?.flashFrame(true)
      new Notification({
        title: 'TimeTracker',
        body: `Your timer has been running for ${alarmInterval} minutes`
      }).show()
      scheduleAlarm(timeInMilliseconds) // reschedule the alarm
    }, timeInMilliseconds)
  }

  ipcMain.handle('flash-window', (_, timeInMilliseconds: number) => {
    // if updating, clear any previous timeouts
    if (alarmTimeout) {
      clearTimeout(alarmTimeout)
    }
    alarmInterval = timeInMilliseconds // save to global value for later use
    saveSettings({ alarmInterval }) // save to userSettings

    scheduleAlarm(timeInMilliseconds)

    return new Date(timeInMilliseconds).toLocaleTimeString()
  })

  ipcMain.handle('get-next-notification-time', () => {
    if (nextAlarmTime) {
      return new Date(nextAlarmTime).toLocaleTimeString()
    }
  })

  ipcMain.handle('disable-repeat-notification', () => {
    if (alarmTimeout) {
      clearTimeout(alarmTimeout)
      nextAlarmTime = null
    }
    saveSettings({ alarmInterval: null })
  })
}
