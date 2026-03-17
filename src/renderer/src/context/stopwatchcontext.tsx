import React, { useRef, useState } from 'react'
import { createContext, useContext, ReactNode } from 'react'
import { LapRow } from 'src/shared/databasetypes/LapRow'

interface StopwatchContextType {
  elapsedGlobalTime: number
  elapsedLapTime: number
  isTimerRunning: boolean
  start: () => void
  stop: () => void
  clear: () => void
  laps: LapRow[]
  lap: (defaultNote?: string) => void
  millisecondsToTime: (ms: number) => StopWatchTime
  convertToTime: (time: StopWatchTime) => React.JSX.Element
  updateNote: (index: number, note: string) => void
  saveToCSV: () => Promise<void>
}

export interface StopWatchTime {
  days: number
  hours: number
  minutes: number
  seconds: number
  milliseconds: number
}

const StopwatchContext = createContext<StopwatchContextType | null>(null)

export function StopwatchProvider({ children }: { children: ReactNode }) {
  const [elapsedGlobalTime, setElapsedGlobalTime] = useState(0)
  const [elapsedLapTime, setElapsedLapTime] = useState(0)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [laps, setLaps] = useState<LapRow[]>([])

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number>(0)
  const lapStartTimeRef = useRef<number>(0)
  const lapCountRef = useRef<number>(0)

  const start = () => {
    if (isTimerRunning) {
      console.log('startTimeRef.current', startTimeRef.current)
      console.log('elapsedGlobalTime', elapsedGlobalTime)
      console.log(laps)
      return
    }
    // intialize our startTimeRefs
    startTimeRef.current = Date.now() - elapsedGlobalTime
    lapStartTimeRef.current = Date.now() - elapsedLapTime

    intervalRef.current = setInterval(() => {
      setElapsedGlobalTime(Date.now() - startTimeRef.current)
      setElapsedLapTime(Date.now() - lapStartTimeRef.current)
    }, 100)
    setIsTimerRunning(true)
  }

  const stop = () => {
    if (!isTimerRunning) return
    lap('Timer paused')
    if (intervalRef.current) clearInterval(intervalRef.current)
    setIsTimerRunning(false)
  }

  const clear = () => {
    if (isTimerRunning) return // do nothing if we are still running
    setElapsedGlobalTime(0)
    setElapsedLapTime(0)
    setLaps([])
    lapCountRef.current = 0
  }

  const millisecondsToTime = (ms: number): StopWatchTime => {
    return {
      days: Math.floor(ms / 86400000),
      hours: Math.floor(ms / 3600000) % 24,
      minutes: Math.floor(ms / 60000) % 60,
      seconds: Math.floor(ms / 1000) % 60,
      milliseconds: ms % 1000
    }
  }

  const lap = (defaultNote: string = '') => {
    if (!isTimerRunning) return

    setLaps((prev) => [
      ...prev,
      {
        id: lapCountRef.current,
        timestarted: new Date(lapStartTimeRef.current).toLocaleString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        }),
        date: new Date().toISOString().split('T')[0],
        lapTime: elapsedLapTime,
        cumulativeTotal: elapsedGlobalTime,
        note: defaultNote
      }
    ])
    lapCountRef.current = lapCountRef.current + 1
    lapStartTimeRef.current = Date.now()
    setElapsedLapTime(0)
  }

  const updateNote = (index: number, note: string) => {
    setLaps((prev) => prev.map((lap, i) => (i === index ? { ...lap, note } : lap)))
  }

  const convertToTime = (time: StopWatchTime): React.JSX.Element => {
    return <p>{convertToTimeString(time)}</p>
  }

  const convertToTimeString = (time: StopWatchTime): string => {
    return `${String(time.days).padStart(2, '0')}:${String(time.hours).padStart(2, '0')}:${String(time.minutes).padStart(2, '0')}:${String(time.seconds).padStart(2, '0')}`
  }

  const saveToCSV = async () => {
    const now = new Date()
    const dateStr = `${now.getMonth() + 1}_${now.getDate()}_${now.getFullYear()}`
    const header = `#Exported from TimeTracker on ${dateStr}\n#ID,Time Started,Lap Time,Cumulative Total,Note\n`
    const rows = laps
      .map(
        (lap) =>
          `${lap.id},${lap.timestarted},${convertToTimeString(millisecondsToTime(lap.lapTime))},${lap.note}`
      )
      .join('\n')

    await window.api.saveCsv(header + rows, dateStr)
  }

  return (
    <StopwatchContext.Provider
      value={{
        elapsedLapTime,
        elapsedGlobalTime,
        isTimerRunning,
        start,
        stop,
        clear,
        millisecondsToTime,
        laps,
        lap,
        convertToTime,
        updateNote,
        saveToCSV
      }}
    >
      {children}
    </StopwatchContext.Provider>
  )
}

export function useStopwatch() {
  const context = useContext(StopwatchContext)
  if (!context) throw new Error('useStopwatch must be used within a StopwatchProvider')
  return context
}
