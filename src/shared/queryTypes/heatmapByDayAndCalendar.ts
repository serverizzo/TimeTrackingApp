export interface heatmapDataByDayAndCalendar {
  date: string
  calendar_name: string
  total: number
  color: string
  laps: { note: string; lap_time: number }[]
}
