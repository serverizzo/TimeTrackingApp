import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      saveCsv: (csvContent: string, dateStr: string) => Promise<void>
    }
  }
}
