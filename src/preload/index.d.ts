import { ElectronAPI } from '@electron-toolkit/preload'
import { LapEntry } from '@renderer/components/visualizations/types'
import { ActivitiesRow } from 'src/shared/databasetypes/ActivitiesRow'
import { CalendarRows } from 'src/shared/databasetypes/calendarRows'
import { LapRow } from 'src/shared/databasetypes/LapRow'
import { HeatmapData } from 'src/shared/queryTypes/heatMapData'
import { LinechartData } from 'src/shared/queryTypes/linechartData'
import { TimelineData } from 'src/shared/queryTypes/timelineData'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      saveCsv: (csvContent: string, dateStr: string) => Promise<void>

      // Laps
      insertLaps: (laps: LapRow[]) => Promise<{ success: boolean }>
      updateLapNote: (timeStarted: string, date: string, note: string) => Promise<void>
      updateLapComments: (timeStarted: string, date: string, comments: string) => Promise<void>
      deleteByNote: (calendarId: number, note: string) => Promise<{ deleted: number }>

      // Visualizations
      getHeatmapData: () => Promise<HeatmapData>
      getLineChartData: (startDate: string | null) => Promise<LinechartData[]>

      //TODO: fix this
      getLapsByRange: (startDate: string, endDate: string) => Promise<LapEntry[]>

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
      getCalendarByActivity: (activityName: string) => Promise<{ name: string; id: number }>

      // Auth
      getToken: () => Promise<string | null>
      saveToken: (token: string) => Promise<{ success: boolean }>
      deleteToken: () => Promise<{ success: boolean }>

      // Timeline
      getTimeLineData: () => Promise<TimelineData[]>

      // Updates:
      openRelasePages: () => Promise<void>

      //Autostart
      getLaunchOnStartup: () => Promise<boolean>
      setLaunchOnStartup: (enabled: boolean) => Promise<void>

      //icons
      openDialog: (id: number) => Promise<null>

      // Notifications
      flashWindow: (timeInMilliseconds: number) => Promise<string>
      getNextNotificationTime: () => Promise<string | null>
      disableRepeatNotifications: () => Promise<void>

      // updates
      // checkForUpdates: () => ipcRenderer.invoke('check-for-updates')
      checkForUpdates: () => Promise<{
        currentVersion: string
        latestVersion: string | null
        updateAvailable: boolean
        releaseUrl: string | null
        error?: string
      }>
      getAppVersion: () => Promise<string>

      // QR Code
      getLocalIP: () => Promise<string>
    }
  }
}
