import { formatDate } from '@renderer/helperFunctions/date/date'
import React from 'react'
import { HeatmapEntry } from 'src/shared/queryTypes/heatmapEntry'

export default function ToolTipDateSummary({
  x,
  y,
  date,
  groups
}: {
  x: number
  y: number
  date: string
  groups: HeatmapEntry[]
}) {
  return (
    <div
      style={{
        position: 'fixed',
        top: y + 12,
        left: x + 12,
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
        {groups.map((heatmapEntry, i) => (
          <span key={heatmapEntry.calendar_name}>
            {i > 0 && <span style={{ color: 'grey' }}> · </span>}
            <span>{heatmapEntry.calendar_name}</span>
          </span>
        ))}
        {groups.map((heatmapEntry) => {
          const cumulativeTime = groups.reduce((sum, entry) => sum + entry.total, 0)
          const dailyPercent = Math.round((heatmapEntry.total / cumulativeTime) * 100)
          return (
            <div
              key={heatmapEntry.calendar_name}
              style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 2,
                  background: heatmapEntry.color ? heatmapEntry.color : '#218648' //TODO: fill this color
                }}
              />
              <span>{heatmapEntry.calendar_name}</span>
              <span style={{ marginLeft: 'auto', paddingLeft: 16, color: '#e9e9e9e0' }}>
                {Math.round(heatmapEntry.total / 60000)}m ({dailyPercent}%)
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
