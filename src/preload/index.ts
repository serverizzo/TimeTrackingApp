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
  insertLaps: (laps: LapRow[]) => ipcRenderer.invoke('insert-laps', laps),
  updateLapNote: (timeStarted: string, date: string, note: string) =>
    ipcRenderer.invoke('update-lap', timeStarted, date, note),
  getHeatmapData: () => ipcRenderer.invoke('get-heatmap-data'),
  getLapsByRange: (startDate: string, endDate: string) =>
    ipcRenderer.invoke('get-laps-by-range', startDate, endDate),

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

  // Auth
  ...authApi,

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
