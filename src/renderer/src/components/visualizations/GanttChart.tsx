import React from 'react'
import { LapEntry } from './types'

interface Props {
  laps: LapEntry[]
  windowStart: Date
  windowEnd: Date
  onPrev: () => void
  onNext: () => void
}

const activityColors: Record<string, { bg: string; border: string; text: string }> = {
  'Timer paused': { bg: '#8f7610', border: '#888780', text: '#eeeeee' }
}

const colorPool = [
  { bg: '#378ADD', border: '#185FA5', text: '#ffffff' },
  { bg: '#1D9E75', border: '#0F6E56', text: '#ffffff' },
  { bg: '#D85A30', border: '#993C1D', text: '#ffffff' },
  { bg: '#7F77DD', border: '#3C3489', text: '#ffffff' },
  { bg: '#BA7517', border: '#854F0B', text: '#ffffff' }
]

function getActivityColor(note: string) {
  if (activityColors[note]) return activityColors[note]
  const index = [...note].reduce((acc, c) => acc + c.charCodeAt(0), 0) % colorPool.length
  activityColors[note] = colorPool[index]
  return activityColors[note]
}

const formatDate = (d: Date) => d.toISOString().split('T')[0]

const parseTimestarted = (timestarted: string): number => {
  const [time, period] = timestarted.split(' ')
  const [hour, minute] = time.split(':').map(Number)
  let hour24 = hour
  if (period === 'PM' && hour !== 12) hour24 = hour + 12
  if (period === 'AM' && hour === 12) hour24 = 0
  return hour24 + minute / 60
}

export default function GanttChart({ laps, windowStart, windowEnd, onPrev, onNext }: Props) {
  const days: Date[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(windowStart)
    d.setDate(windowStart.getDate() + i)
    days.push(d)
  }

  const lapsByDay = new Map<string, LapEntry[]>()
  days.forEach((d) => lapsByDay.set(formatDate(d), []))
  laps.forEach((lap) => {
    const existing = lapsByDay.get(lap.date) ?? []
    lapsByDay.set(lap.date, [...existing, lap])
  })

  const startHours = laps.map((l) => parseTimestarted(l.timestarted))
  const endHours = laps.map((l) => parseTimestarted(l.timestarted) + l.lap_time / 3600000)
  const DAY_START = laps.length > 0 ? Math.max(0, Math.floor(Math.min(...startHours)) - 1) : 8
  const DAY_END = laps.length > 0 ? Math.min(24, Math.ceil(Math.max(...endHours)) + 1) : 20
  const DAY_HOURS = DAY_END - DAY_START

  const hours: number[] = []
  for (let h = DAY_START; h <= DAY_END; h += 2) {
    hours.push(h)
  }

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <button onClick={onPrev}>←</button>
        <span style={{ fontSize: 13, color: 'grey' }}>
          {windowStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} —{' '}
          {windowEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
        <button onClick={onNext}>→</button>
      </div>

      <div style={{ display: 'flex', marginBottom: 6, marginLeft: 56 }}>
        {hours.map((h) => (
          <span key={h} style={{ flex: 1, fontSize: 10, color: 'grey', textAlign: 'center' }}>
            {h < 12 ? `${h}am` : h === 12 ? '12pm' : `${h - 12}pm`}
          </span>
        ))}
      </div>

      {days.map((day) => {
        const dateStr = formatDate(day)
        const dayLaps = lapsByDay.get(dateStr) ?? []
        return (
          <div key={dateStr} style={{ display: 'flex', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 10, color: 'grey', width: 52, flexShrink: 0 }}>
              {day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
            <div
              style={{
                flex: 1,
                height: 26,
                background: 'rgba(128,128,128,0.1)',
                borderRadius: 4,
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {dayLaps.map((lap, i) => {
                const startHour = parseTimestarted(lap.timestarted)
                const durationHours = lap.lap_time / 3600000
                const left = ((startHour - DAY_START) / DAY_HOURS) * 100
                const width = (durationHours / DAY_HOURS) * 100
                const c = getActivityColor(lap.note || 'Timer paused')
                return (
                  <div
                    key={i}
                    title={`${lap.note || 'Timer paused'} — ${Math.round(lap.lap_time / 60000)}m`}
                    style={{
                      position: 'absolute',
                      left: `${left}%`,
                      width: `${Math.max(width, 0.5)}%`,
                      height: '100%',
                      background: c.bg,
                      border: `1px solid ${c.border}`,
                      borderRadius: 3,
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0 4px',
                      fontSize: 10,
                      color: c.text,
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      boxSizing: 'border-box'
                    }}
                  >
                    {lap.note}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
