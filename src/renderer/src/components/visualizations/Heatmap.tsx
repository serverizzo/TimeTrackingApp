import { useState } from 'react'
import { HeatmapEntry } from './types'
import { DebugStyles } from '@renderer/styles.ts/debugStyle'
import { runningIcon, walkingIcon } from '@renderer/assets/icons'

interface Props {
  data: HeatmapEntry[]
}

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function getColor(total: number, max: number): string {
  if (total === 0 || max === 0) return 'rgba(128,128,128,0.1)'
  const intensity = total / max
  if (intensity < 0.25) return '#9FE1CB'
  if (intensity < 0.5) return '#5DCAA5'
  if (intensity < 0.75) return '#1D9E75'
  return '#0F6E56'
}

export default function Calendar({ data }: Props) {
  const [viewDate, setViewDate] = useState(new Date())

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()

  const dataMap = new Map(data.map((d) => [d.date, d.total]))
  const monthEntries = data.filter((d) => {
    const [y, m] = d.date.split('-').map(Number)
    return y === year && m === month + 1
  })
  const maxTotal = Math.max(...monthEntries.map((d) => d.total), 1)

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1)
  ]

  const shiftMonth = (delta: number) => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1))
  }

  return (
    <div
      style={{
        marginBottom: '1.5rem',
        width: 500 // this is the width of the calandar
        // ,...DebugStyles.divOutline
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <button onClick={() => shiftMonth(-1)}>←</button>
        <span style={{ fontSize: 13, color: 'grey', minWidth: 120, textAlign: 'center' }}>
          {viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </span>
        <button onClick={() => shiftMonth(1)}>→</button>
      </div>

      <div
        style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 4 }}
      >
        {DAYS_OF_WEEK.map((d) => (
          <div
            key={d}
            style={{ fontSize: 10, color: 'grey', textAlign: 'center', paddingBottom: 4 }}
          >
            {d}
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
        {cells.map((day, i) => {
          if (day === null) return <div key={`empty-${i}`} />
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const total = dataMap.get(dateStr) ?? 0
          const isToday = new Date().toISOString().split('T')[0] === dateStr
          return (
            <div
              key={dateStr}
              style={{
                aspectRatio: '1',
                borderRadius: 6,
                background: getColor(total, maxTotal),
                display: 'flex',
                // alignItems: 'center',
                // justifyContent: 'center',
                padding: 5,
                fontSize: 11,
                color: total > 0 ? 'white' : 'grey',
                border: isToday ? '2px solid #ac600ae0' : '0px solid transparent',
                cursor: 'default',
                boxSizing: 'border-box'
              }}
            >
              {day}
              <img src={runningIcon} alt="running" width={24} height={24} />
              <img src={walkingIcon} alt="running" width={24} height={24} />
            </div>
          )
        })}
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          marginTop: 10,
          fontSize: 11,
          color: 'grey'
        }}
      >
        Less
        {['rgba(128,128,128,0.1)', '#9FE1CB', '#5DCAA5', '#1D9E75', '#0F6E56'].map((c, i) => (
          <div key={i} style={{ width: 13, height: 13, borderRadius: 3, background: c }} />
        ))}
        More
      </div>
    </div>
  )
}
