import { useStopwatch } from '@renderer/context/stopwatchcontext'
import React from 'react'

export default function LapDisplay() {
  const { laps, convertToTime, millisecondsToTime } = useStopwatch()
  return (
    <table>
      <thead>
        <tr>
          <th style={styles.cellStyle}>Time Started</th>
          <th style={styles.cellStyle}>Lap Time</th>
          <th style={styles.cellStyle}>Cumulative Total</th>
        </tr>
      </thead>
      <tbody>
        {laps.map((ele, index) => (
          <tr key={index}>
            <td style={styles.cellStyle}>{ele.timestarted}</td>
            <td style={styles.cellStyle}>{convertToTime(millisecondsToTime(ele.lapTime))}</td>
            <td style={styles.cellStyle}>
              {convertToTime(millisecondsToTime(ele.cumulativeTotal))}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
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
