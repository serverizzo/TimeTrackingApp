import { CheckinItemByDay } from './checkinItemByDay'
import { heatmapDataByDayAndCalendar } from './heatmapByDayAndCalendar'

export interface HeatmapData {
  heatmapDataByDayAndCalendarArr: heatmapDataByDayAndCalendar[]
  checkinItemByDayArr: CheckinItemByDay[]
}
