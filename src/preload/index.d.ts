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
      insertDailyCheckin: (date: string, activityIds: Array<number>) => Promise<void>
    }
  }
}
