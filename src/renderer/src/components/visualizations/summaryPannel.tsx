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
  filteredLaps.forEach((lap) => {
    dayTotals.set(lap.date, (dayTotals.get(lap.date) ?? 0) + lap.lap_time)
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

  const maxMs = Math.max(...Array.from(dayTotals.values()), 1)

  const activityTotals = new Map<string, number>()
  filteredLaps.forEach((lap) => {
    activityTotals.set(lap.note, (activityTotals.get(lap.note) ?? 0) + lap.lap_time)
  })
  const maxActivityMs = Math.max(...Array.from(activityTotals.values()), 1)

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
          { label: 'Best day', value: `${bestDay.date} (${(bestDay.ms / 3600000).toFixed(1)}h)` }
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

      <p style={{ fontSize: 13, color: 'grey', margin: '0 0 8px' }}>Hours per activity</p>
      {Array.from(activityTotals.entries()).map(([note, ms]) => (
        <div key={note} style={{ display: 'flex', alignItems: 'center', marginBottom: 6, gap: 8 }}>
          <span
            style={{ fontSize: 11, color: 'grey', width: 80, flexShrink: 0, textAlign: 'right' }}
          >
            {note}
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
                width: `${(ms / maxActivityMs) * 100}%`,
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
