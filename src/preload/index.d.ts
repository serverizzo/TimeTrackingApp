import { ElectronAPI } from '@electron-toolkit/preload'
import { ActivitiesRow } from 'src/shared/databasetypes/ActivitiesRow'
import { CalendarRows } from 'src/shared/databasetypes/calendarRows'
import { LapRow } from 'src/shared/databasetypes/LapRow'
import { HeatmapEntry } from 'src/shared/queryTypes/heatmapEntry'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      saveCsv: (csvContent: string, dateStr: string) => Promise<void>
      insertLaps: (laps: LapRow[]) => Promise<{ success: boolean }>
      updateLapNote: (timeStarted: string, date: string, note: string) => Promise<void>
      getHeatmapData: () => Promise<HeatmapEntry[]>
      getLapsByRange: (
        startDate: string,
        endDate: string
      ) => Promise<{ timestarted: string; date: string; lap_time: number; note: string }[]>

      // Activities
      getActivities: () => Promise<ActivitiesRow[]>
      updateActivity: (activitiesRows: ActivitiesRow[]) => Promise<void>
      insertNewActivity: () => Promise<void>
      deleteActivity: (id: number) => Promise<void>

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
      saveNotes: (content: string) => Promise<void>
      saveDraft: (content: string) => Promise<void>
      getDraft: () => Promise<string | null>
      deleteDraft: () => Promise<void>
      saveEditorState: (state: string) => Promise<void>
      getEditorState: () => Promise<string>

      // Calendars
      getCalendars: () => Promise<CalendarRows[]>
      insertNewCalendar: () => Promise<void>
      updateCalendar: (calandarRows: CalendarRows[]) => Promise<void>

      // Auth
      getToken: () => Promise<string | null>
      saveToken: (token: string) => Promise<{ success: boolean }>
      deleteToken: () => Promise<{ success: boolean }>
    }
  }
}
