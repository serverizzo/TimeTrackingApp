import { ElectronAPI } from '@electron-toolkit/preload'
import { LapRow } from 'src/shared/databasetypes/LapRow'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      saveCsv: (csvContent: string, dateStr: string) => Promise<void>
      insertLaps: (laps: LapRow[]) => Promise<void>
    }
  }
}
