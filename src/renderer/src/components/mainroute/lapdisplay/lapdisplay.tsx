import { useStopwatch } from '@renderer/context/stopwatchcontext'
import React from 'react'

export default function LapDisplay() {
  const { laps, convertToTime, millisecondsToTime } = useStopwatch()
  return (
    <div>
      <div style={{ display: 'flex' }}>
        <p style={styles.cellStyle}>lapTime</p>
        <p style={styles.cellStyle}>cumulativeTotal</p>
      </div>
      {laps.map((ele) => (
        <div style={{ display: 'flex' }}>
          <p style={styles.cellStyle}>{convertToTime(millisecondsToTime(ele.lapTime))}</p>
          <p style={styles.cellStyle}>{convertToTime(millisecondsToTime(ele.cumulativeTotal))}</p>
        </div>
      ))}
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  cellStyle: {
    borderColor: 'green',
    borderStyle: 'solid',
    borderWidth: '1px',
    margin: 5
  }
}
