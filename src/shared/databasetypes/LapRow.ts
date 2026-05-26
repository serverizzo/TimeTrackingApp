export interface LapRow {
  id: number // not used for the db, it's just for react rendering purposes.
  timestarted: string
  date: string
  lapTime: number
  note: string
  cumulativeTotal: number
  calendar: string
  calendarId: number
}
