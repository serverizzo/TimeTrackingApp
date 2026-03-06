import React, { useState } from 'react'
import { createContext, useContext, ReactNode } from 'react'

interface StopwatchContextType {
  elapsedGlobalTime: number
  elapsedLapTime: number
}

interface StopWatchTime {
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

  return (
    <StopwatchContext.Provider value={{ elapsedLapTime, elapsedGlobalTime }}>
      {children}
    </StopwatchContext.Provider>
  )
}

export function useStopwatch() {
  const context = useContext(StopwatchContext)
  if (!context) throw new Error('useStopwatch must be used within a StopwatchProvider')
  return context
}
