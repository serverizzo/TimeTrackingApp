export interface TimelineData {
  date: string
  laparray: {
    calendarcolor: string
    calendarname: string
    lap_time: number
    timestarted: string
    note: string
  }[]
  activities:
    | {
        location: string
        icon_name: string
      }[]
    | null
}
