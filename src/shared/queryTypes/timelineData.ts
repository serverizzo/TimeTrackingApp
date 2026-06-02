export interface TimelineData {
  date: string
  laparray: {
    timestarted: string
    date: string
    note: string
    lap_time: number
    color: string
    calendar_name: string
  }[]
  activities:
    | {
        location: string
        icon_name: string
      }[]
    | null
}
