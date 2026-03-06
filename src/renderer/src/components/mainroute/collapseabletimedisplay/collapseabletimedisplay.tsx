import { useStopwatch } from '@renderer/context/stopwatchcontext'
import React from 'react'
import { StopWatchTime } from '@renderer/context/stopwatchcontext'

export default function CollapseableTimeDisplay() {
  const { elapsedGlobalTime, elapsedLapTime, millisecondsToTime } = useStopwatch()

  const time: StopWatchTime = millisecondsToTime(elapsedGlobalTime)

  return (
    <div>
      <p>Total Time</p>
      <p>days: hr: min: sec: ms</p>
      <p>
        {time.days < 10 ? 0 : ''}
        {time.days}:{time.hours < 10 ? 0 : ''}
        {time.hours}:{time.minutes < 10 ? 0 : ''}
        {time.minutes}:{time.seconds < 10 ? 0 : ''}
        {time.seconds}
      </p>
      <p>Lap Time</p>
      <p>{elapsedLapTime}</p>
    </div>
  )
}
