import { ElectronAPI } from '@electron-toolkit/preload'
import { LapRow } from 'src/shared/databasetypes/LapRow'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      saveCsv: (csvContent: string, dateStr: string) => Promise<void>
      insertLaps: (laps: LapRow[]) => Promise<{ success: boolean }>
      getHeatmapData: () => Promise<{ date: string; total: number }[]>
      getLapsByRange: (
        startDate: string,
        endDate: string
      ) => Promise<{ timestarted: string; date: string; lap_time: number; note: string }[]>
      getActivities: () => Promise<{ id: number; name: string }[]>
      updateCheckin: (
        date: string,
        checkedList: Array<{ id: number; isChecked: boolean }>
      ) => Promise<void>
      getCheckedActivities: (
        date: string
      ) => Promise<{ name: string; id: number; isChecked: boolean }[]>
      getCheckedActivitiesByMonth: (
        startDate: string,
        endDate: string
      ) => Promise<{ date: string; id: number; name: string; iconLocation: string }[]>
      getUserDataPath: () => Promise<string>
      getNotes: () => Promise<string>
    }
  }
}
