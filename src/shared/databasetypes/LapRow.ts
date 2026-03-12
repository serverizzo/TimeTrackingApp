export interface LapRow {
  id: number // not used for the db, it's just for react rendering purposes.
  timestarted: string
  date: string // saved in ISO 8601 standard (yyyy-mm-dd)
  lapTime: string
  cumulativeTotal: string
  note: string
}
