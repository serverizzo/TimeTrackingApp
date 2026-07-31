import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { LapRow } from '../shared/databasetypes/LapRow'
import { notesApi } from './apis/notesApi'
import { ActivitiesRow } from '../shared/databasetypes/ActivitiesRow'
import { CalendarRows } from '../shared/databasetypes/calendarRows'
import { authApi } from './apis/authApi'

// Custom APIs for renderer
const api = {
  saveCsv: (csvContent: string, dateStr: string) =>
    ipcRenderer.invoke('save-csv', csvContent, dateStr),

  // Laps
  insertLaps: (laps: LapRow[]) => ipcRenderer.invoke('insert-laps', laps),
  updateLapNote: (timeStarted: string, date: string, note: string) =>
    ipcRenderer.invoke('update-lap', timeStarted, date, note),
  updateLapComments: (timeStarted: string, date: string, note: string) =>
    ipcRenderer.invoke('update-lap-comments', timeStarted, date, note),
  deleteByNote: (calendarId: number, note: string) =>
    ipcRenderer.invoke('delete-by-note', calendarId, note),

  // visualizations
  getHeatmapData: () => ipcRenderer.invoke('get-heatmap-data'),
  getLapsByRange: (startDate: string, endDate: string) =>
    ipcRenderer.invoke('get-laps-by-range', startDate, endDate),
  getLineChartData: (startDate: Date) => ipcRenderer.invoke('get-linechart-data', startDate),

  // Activities
  getActivities: () => ipcRenderer.invoke('get-activities'),
  updateActivity: (activitiesRows: ActivitiesRow[]) =>
    ipcRenderer.invoke('update-activity', activitiesRows),
  insertNewActivity: () => ipcRenderer.invoke('insert-new-activity'),
  deleteActivity: (id: number) => ipcRenderer.invoke('remove-activity', id),

  updateCheckin: (date: string, checkedList: { id: number; isChecked: boolean }[]) =>
    ipcRenderer.invoke('update-checkins', date, checkedList),
  getCheckedActivities: (date: string) => ipcRenderer.invoke('get-checked-activities', date),
  getCheckedActivitiesByMonth: (dateStart: string, dateEnd: string) =>
    ipcRenderer.invoke('get-checked-activities-by-month', dateStart, dateEnd),
  getUserDataPath: () => ipcRenderer.invoke('get-user-data-path'),

  // Calendars
  getCalendars: () => ipcRenderer.invoke('get-calendars'),
  insertNewCalendar: () => ipcRenderer.invoke('insert-new-calendar'),
  updateCalendar: (calendarRows: CalendarRows[]) =>
    ipcRenderer.invoke('update-calendar', calendarRows),
  getCalendarByActivity: (activityName: string) =>
    ipcRenderer.invoke('get-calendar-by-activity', activityName),

  // Icon handlers
  openDialog: (id: number) => ipcRenderer.invoke('open-dialog', id),

  // Auth
  ...authApi,

  // Timeline
  getTimeLineData: () => ipcRenderer.invoke('get-timeline-data'),

  // Updates
  openRelasePages: () => ipcRenderer.invoke('open-release-pages'),

  // Autostart:
  getLaunchOnStartup: () => ipcRenderer.invoke('get-launch-on-startup'),
  setLaunchOnStartup: (enabled: boolean) => ipcRenderer.invoke('set-launch-on-startup', enabled),

  // Notifications
  flashWindow: (timeInMilliseconds: number) =>
    ipcRenderer.invoke('flash-window', timeInMilliseconds),
  getNextNotificationTime: () => ipcRenderer.invoke('get-next-notification-time'),
  disableRepeatNotifications: (checked: boolean) =>
    ipcRenderer.invoke('disable-repeat-notification', checked),

  //Updates
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),

  //QR code
  getLocalIP: () => ipcRenderer.invoke('get-local-ip'),

  ...notesApi
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
