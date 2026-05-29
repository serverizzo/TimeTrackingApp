import { formatDate } from '@renderer/helperFunctions/date/date'
import React from 'react'
import { HeatmapDataByDayAndCalendar } from 'src/shared/queryTypes/heatmapByDayAndCalendar'

export default function ToolTipDateSummary({
  x,
  y,
  date,
  groups
}: {
  x: number
  y: number
  date: string
  groups: HeatmapDataByDayAndCalendar[]
}) {
  return (
    <div
      style={{
        position: 'fixed',
        top: y + 5,
        left: x + 5,
        background: '#1a1a1a',
        border: '0.5px solid rgba(114, 114, 114, 0.15)',
        borderRadius: 6,
        padding: '8px 12px',
        zIndex: 999,
        fontSize: 12,
        color: 'white',
        pointerEvents: 'none'
      }}
    >
      <div>
        <p>{formatDate(date)}</p>
        {groups.map((heatmapEntry) => {
          const cumulativeTime = groups.reduce((sum, entry) => sum + entry.total, 0)
          const dailyPercent = Math.round((heatmapEntry.total / cumulativeTime) * 100)
          return (
            <div>
              <div
                key={heatmapEntry.calendar_name}
                style={{ display: 'flex', alignItems: 'center' }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 2,
                    background: heatmapEntry.color ? heatmapEntry.color : '#218648' //TODO: fill this color
                  }}
                />
                <span style={{ marginLeft: '5px' }}>{heatmapEntry.calendar_name}</span>
                <span style={{ marginLeft: 'auto', paddingLeft: 16 }}>
                  {Math.round(heatmapEntry.total / 60000)}m ({dailyPercent}%)
                </span>
              </div>

              {/* by lap */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {heatmapEntry.laps.map((lap) => {
                  const cumulativeDailyLapTime = heatmapEntry.laps.reduce(
                    (sum, entry) => sum + entry.lap_time,
                    0
                  )
                  const dailyLapPercentage = Math.round(
                    (lap.lap_time / cumulativeDailyLapTime) * 100
                  )
                  return (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ paddingLeft: '1rem', marginLeft: '5px', color: '#b8b8b8e0' }}>
                        {lap.note}
                      </span>
                      <span style={{ marginLeft: 'auto', paddingLeft: 16, color: '#b8b8b8e0' }}>
                        {Math.round(lap.lap_time / 60000)}m ({dailyLapPercentage}%)
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
