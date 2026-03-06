import React, { useRef, useState } from 'react'
import { createContext, useContext, ReactNode } from 'react'

interface StopwatchContextType {
  elapsedGlobalTime: number
  elapsedLapTime: number
  isTimerRunning: boolean
  start: () => void
  stop: () => void
  clear: () => void
  laps: LapRows[]
  millisecondsToTime: (ms: number) => StopWatchTime
}

interface LapRows {
  timestarted: number
  lapTime: number
  cumulativeTotal: number
  note: string
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

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number>(0)

  const start = () => {
    if (isTimerRunning) {
      console.log('startTimeRef.current', startTimeRef.current)
      console.log('elapsedGlobalTime', elapsedGlobalTime)
      return
    }
    startTimeRef.current = Date.now() - elapsedGlobalTime
    intervalRef.current = setInterval(() => {
      setElapsedGlobalTime(Date.now() - startTimeRef.current)
    }, 100)
    setIsTimerRunning(true)
  }

  const stop = () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setIsTimerRunning(false)
  }

  const clear = () => {
    if (isTimerRunning) return // do nothing if we are still running
    setElapsedGlobalTime(0)
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

  return (
    <StopwatchContext.Provider
      value={{
        elapsedLapTime,
        elapsedGlobalTime,
        isTimerRunning,
        start,
        stop,
        clear,
        millisecondsToTime
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
