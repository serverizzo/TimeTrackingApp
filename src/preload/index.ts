import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { LapRow } from '../shared/databasetypes/LapRow'

// Custom APIs for renderer
const api = {
  saveCsv: (csvContent: string, dateStr: string) =>
    ipcRenderer.invoke('save-csv', csvContent, dateStr),
  insertLaps: (laps: LapRow[]) => ipcRenderer.invoke('insert-laps', laps),
  getHeatmapData: () => ipcRenderer.invoke('get-heatmap-data'),
  getLapsByRange: (startDate: string, endDate: string) =>
    ipcRenderer.invoke('get-laps-by-range', startDate, endDate)
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
