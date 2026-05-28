import React, { useEffect, useRef, useState } from 'react'
import { LapEntry } from './types'
import { InputStyle } from '@renderer/styles.ts/inputStyle'

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

interface TooltipState {
  x: number
  y: number
  lap: LapEntry
}

export default function GanttChart({ laps, windowStart, windowEnd, onPrev, onNext }: Props) {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)
  const [showToolTip, setShowToolTip] = useState<boolean>(false)
  const [editingNote, setEditingNote] = useState<string>('')
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const [editingComment, setEditingComment] = useState<string>('')

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

  const [zoom, setZoom] = useState<number>(1)
  const [panOffset, setPanOffset] = useState<number>(0)
  const [isPanning, setIsPanning] = useState<boolean>(false)
  const panStartX = useRef<number>(0)
  const panStartOffset = useRef<number>(0)

  const visibleHours = DAY_HOURS / zoom
  const DAY_START_VISIBLE = Math.max(0, panOffset)
  const DAY_END_VISIBLE = Math.min(24, panOffset + visibleHours)

  const hours: number[] = []
  for (let h = Math.floor(DAY_START_VISIBLE); h <= Math.ceil(DAY_END_VISIBLE); h++) {
    hours.push(h)
  }

  const handleWheel = (e: React.WheelEvent) => {
    // e.preventDefault()
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1
    setZoom((prev) => Math.min(Math.max(prev * zoomFactor, 1), 8))
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsPanning(true)
    panStartX.current = e.clientX
    panStartOffset.current = panOffset
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return
    const delta = (panStartX.current - e.clientX) / 100
    const newOffset = Math.max(0, Math.min(24 - visibleHours, panStartOffset.current + delta))
    setPanOffset(newOffset)
  }

  const handleMouseUp = () => setIsPanning(false)

  useEffect(() => {
    if (zoom === 1) setPanOffset(0)
  }, [zoom])

  const handleSaveNote = async () => {
    if (!tooltip) return

    await window.api.updateLapNote(tooltip.lap.timestarted, tooltip.lap.date, editingNote)
    setIsEditing(false)
    setTooltip(null)
  }

  const handleSaveComment = async () => {
    if (!tooltip) return

    await window.api.updateLapComments(tooltip.lap.timestarted, tooltip.lap.date, editingComment)
    setIsEditing(false)
    setTooltip(null)
  }

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <button onClick={onPrev}>←</button>
          <span style={{ fontSize: 13, color: 'grey' }}>
            {windowStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} —{' '}
            {windowEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
          <button onClick={onNext}>→</button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <button onClick={() => setZoom((prev) => Math.max(prev * 0.9, 1))}>−</button>
          <span style={{ fontSize: 11, color: 'grey' }}>{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom((prev) => Math.min(prev * 1.1, 8))}>+</button>
          <button
            onClick={() => {
              setZoom(1)
              setPanOffset(0)
            }}
          >
            Reset
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', marginBottom: 6, marginLeft: 56 }}>
        {hours.map((h) => (
          <span key={h} style={{ flex: 1, fontSize: 10, color: 'grey', textAlign: 'center' }}>
            {h < 12 ? `${h}am` : h === 12 ? '12pm' : `${h - 12}pm`}
          </span>
        ))}
      </div>

      <div
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor: isPanning ? 'grabbing' : 'grab' }}
      >
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
                  const left =
                    ((startHour - DAY_START_VISIBLE) / (DAY_END_VISIBLE - DAY_START_VISIBLE)) * 100
                  const width = (durationHours / (DAY_END_VISIBLE - DAY_START_VISIBLE)) * 100
                  const c = getActivityColor(lap.note || 'Timer paused')
                  return (
                    <div
                      key={i}
                      // title={`${lap.note || 'Timer paused'} — ${Math.round(lap.lap_time / 60000)}m`}
                      onMouseEnter={(e) => {
                        if (!isPanning && !isEditing) {
                          setTooltip({ x: e.clientX, y: e.clientY, lap })
                          setShowToolTip(true)
                        }
                      }}
                      onMouseLeave={() => setShowToolTip(false)}
                      onDoubleClick={() => {
                        setEditingNote(lap.note || '')
                        setEditingComment(lap.comments)
                        setIsEditing(true)
                        setTooltip({ x: 0, y: 0, lap })
                      }}
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

      {/* Hover tooltip */}
      {tooltip && showToolTip && !isEditing && (
        <div
          style={{
            position: 'fixed',
            top: tooltip.y + 12,
            left: tooltip.x + 12,
            background: '#1a1a2e',
            border: '0.5px solid grey',
            borderRadius: 6,
            padding: '8px 12px',
            fontSize: 11,
            zIndex: 1000,
            pointerEvents: 'none'
          }}
        >
          <p style={{ margin: '0 0 4px', fontWeight: 500 }}>{tooltip.lap.note || 'Timer paused'}</p>
          <p style={{ margin: '0 0 2px', color: 'grey' }}>Started: {tooltip.lap.timestarted}</p>
          <p style={{ margin: 0, color: 'grey' }}>
            Duration: {Math.round(tooltip.lap.lap_time / 60000)}m
          </p>

          <p>Comments:</p>
          <p style={{ marginLeft: '10px' }}>{tooltip.lap.comments}</p>
          <p style={{ margin: '4px 0 0', color: 'grey', fontStyle: 'italic' }}>
            Double click to edit
          </p>
        </div>
      )}

      {/* Edit popover */}
      {isEditing && tooltip && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: '#1a1a2e',
            border: '0.5px solid grey',
            borderRadius: 8,
            padding: '1rem',
            fontSize: 13,
            zIndex: 1000,
            minWidth: 280
          }}
        >
          <p style={{ margin: '0 0 8px', fontWeight: 500 }}>Edit note comments:</p>
          <p>{`Activity: ${tooltip.lap.note}`}</p>
          <p style={{ margin: '0 0 8px', fontSize: 11, color: 'grey' }}>
            {tooltip.lap.timestarted} — {Math.round(tooltip.lap.lap_time / 60000)}m
          </p>
          <p>Previous comments:</p>
          <p style={{ marginLeft: '10px', marginBottom: 10 }}>{tooltip.lap.comments}</p>
          {/* Remove the ability to change the name of the lap */}
          {/* <input
            autoFocus
            value={editingNote}
            onChange={(e) => setEditingNote(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveNote()
              if (e.key === 'Escape') {
                setIsEditing(false)
                setTooltip(null)
              }
            }}
            style={styles.inputStyle}
          /> */}
          {/* Edit comments on lap */}
          <textarea
            autoFocus
            value={editingComment}
            onChange={(e) => setEditingComment(e.target.value)}
            style={styles.inputStyle}
            rows={5}
          />
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button
              onClick={() => {
                setIsEditing(false)
                setTooltip(null)
              }}
            >
              Cancel
            </button>
            <button onClick={handleSaveComment}>Save</button>
          </div>
        </div>
      )}
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  inputStyle: {
    width: '100%',
    padding: '6px 8px',
    borderRadius: 4,
    border: '0.5px solid grey',
    background: 'transparent',
    color: 'inherit',
    fontSize: 13,
    boxSizing: 'border-box',
    marginBottom: 8,
    outline: 'none'
  }
}
