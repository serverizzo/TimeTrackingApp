import { useStopwatch } from '@renderer/context/stopwatchcontext'
import React from 'react'
import { StopWatchTime } from '@renderer/context/stopwatchcontext'

export default function CollapseableTimeDisplay() {
  const { elapsedGlobalTime, elapsedLapTime, millisecondsToTime, convertToTime } = useStopwatch()

  const time: StopWatchTime = millisecondsToTime(elapsedGlobalTime)
  const lapTime: StopWatchTime = millisecondsToTime(elapsedLapTime)

  return (
    <div>
      <p>Total Time</p>
      <p>days: hr: min: sec: ms</p>
      <p>{convertToTime(time)}</p>
      <p>Lap Time</p>
      <p>{convertToTime(lapTime)}</p>
    </div>
  )
}
