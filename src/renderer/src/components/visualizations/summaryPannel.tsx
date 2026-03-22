import React, { useState } from 'react'
import { LapEntry } from './types'

interface Props {
  laps: LapEntry[]
}

export default function SummaryPanel({ laps }: Props) {
  const [selectedActivity, setSelectedActivity] = useState<string>('All')

  const activities = [
    'All',
    ...Array.from(new Set(laps.map((l) => l.note).filter((n) => n && n !== 'Timer paused')))
  ]

  const filteredLaps =
    selectedActivity === 'All'
      ? laps.filter((l) => l.note !== 'Timer paused')
      : laps.filter((l) => l.note === selectedActivity)

  const totalMs = filteredLaps.reduce((sum, l) => sum + l.lap_time, 0)
  const totalHours = (totalMs / 3600000).toFixed(1)

  const dayTotals = new Map<string, number>()
  filteredLaps.forEach((lap: LapEntry) => {
    let dateArray = lap.date.split('-').map(Number)
    let date = new Date(dateArray[0], dateArray[1] - 1, dateArray[2])
    let dateString = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    dayTotals.set(dateString, (dayTotals.get(lap.date) ?? 0) + lap.lap_time)
  })

  const avgHours =
    dayTotals.size > 0
      ? (
          Array.from(dayTotals.values()).reduce((s, v) => s + v, 0) /
          dayTotals.size /
          3600000
        ).toFixed(1)
      : '0.0'

  const bestDay = Array.from(dayTotals.entries()).reduce(
    (best, [date, ms]) => (ms > best.ms ? { date, ms } : best),
    { date: '-', ms: 0 }
  )

  const maxDayMs = Math.max(...Array.from(dayTotals.values()), 1)

  return (
    <div>
      <p style={{ fontSize: 13, color: 'grey', marginBottom: 8 }}>Summary</p>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        {activities.map((a) => (
          <button
            key={a}
            onClick={() => setSelectedActivity(a)}
            style={{
              fontSize: 11,
              padding: '4px 10px',
              borderRadius: 99,
              cursor: 'pointer',
              border: '0.5px solid grey',
              background: selectedActivity === a ? '#7F77DD' : 'transparent',
              color: selectedActivity === a ? 'white' : 'grey'
            }}
          >
            {a}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
        {[
          { label: 'Total hours', value: `${totalHours}h` },
          { label: 'Daily average', value: `${avgHours}h` },
          {
            label: 'Best day',
            value: `${bestDay.date} (${(bestDay.ms / 3600000).toFixed(1)}h)`
          }
        ].map((m) => (
          <div
            key={m.label}
            style={{
              background: 'rgba(128,128,128,0.1)',
              borderRadius: 8,
              padding: '1rem',
              flex: 1,
              minWidth: 0
            }}
          >
            <p style={{ fontSize: 12, color: 'grey', margin: '0 0 4px' }}>{m.label}</p>
            <p style={{ fontSize: 24, fontWeight: 500, margin: 0 }}>{m.value}</p>
          </div>
        ))}
      </div>

      <p style={{ fontSize: 13, color: 'grey', margin: '0 0 8px' }}>Hours per day</p>
      {Array.from(dayTotals.entries()).map(([date, ms]) => (
        <div key={date} style={{ display: 'flex', alignItems: 'center', marginBottom: 6, gap: 8 }}>
          <span
            style={{
              fontSize: 11,
              color: 'grey',
              width: 52,
              flexShrink: 0,
              textAlign: 'right'
            }}
          >
            {date}
          </span>
          <div
            style={{
              flex: 1,
              height: 18,
              background: 'rgba(128,128,128,0.1)',
              borderRadius: 3,
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                width: `${(ms / maxDayMs) * 100}%`,
                height: '100%',
                background: '#7F77DD',
                borderRadius: 3,
                display: 'flex',
                alignItems: 'center',
                paddingLeft: 6,
                fontSize: 10,
                color: 'white',
                boxSizing: 'border-box'
              }}
            >
              {(ms / 3600000).toFixed(1)}h
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
