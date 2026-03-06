import { useStopwatch } from '@renderer/context/stopwatchcontext'
import React from 'react'

export default function CollapseableTimeDisplay() {
  const { elapsedGlobalTime, elapsedLapTime } = useStopwatch()

  return (
    <div>
      <p>Total Time</p>
      <p>{elapsedGlobalTime}</p>
      <p>Lap Time</p>
      <p>{elapsedLapTime}</p>
    </div>
  )
}
