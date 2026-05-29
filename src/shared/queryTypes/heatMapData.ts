import { CheckinItemByDay } from './checkinItemByDay'
import { HeatmapDataByDayAndCalendar } from './heatmapByDayAndCalendar'

export interface HeatmapData {
  heatmapDataByDayAndCalendarArr: HeatmapDataByDayAndCalendar[]
  checkinItemByDayArr: CheckinItemByDay[]
}
