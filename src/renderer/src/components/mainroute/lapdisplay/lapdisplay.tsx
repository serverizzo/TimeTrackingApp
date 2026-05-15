import { useStopwatch } from '@renderer/context/stopwatchcontext'
import React, { Activity, useEffect, useState } from 'react'
import { ActivitiesRow } from 'src/shared/databasetypes/ActivitiesRow'

export default function LapDisplay() {
  const { laps, convertToTime, millisecondsToTime, updateNote } = useStopwatch()

  const [activities, setActivities] = useState<ActivitiesRow[]>()

  useEffect(() => {
    const getActivities = async () => {
      const activities = await window.api.getActivities()
      setActivities(activities)
    }
    getActivities()
  }, [])

  useEffect(() => {
    const activitiesArray = activities
      ?.filter((activity) => activity.isTrackedInLaps)
      .map((activity) => activity.name)
    console.log(activitiesArray)
  }, [activities])

  return (
    <table>
      <thead>
        <tr>
          <th style={styles.cellStyle}>Time Started</th>
          <th style={styles.cellStyle}>Lap Time</th>
          <th style={styles.cellStyle}>Cumulative Total</th>
          <th style={styles.cellStyle}>Notes</th>
        </tr>
      </thead>
      <tbody>
        {laps.map((ele, index) => (
          <tr key={ele.id}>
            <td style={styles.cellStyle}>{ele.timestarted}</td>
            <td style={styles.cellStyle}>{convertToTime(millisecondsToTime(ele.lapTime))}</td>
            <td style={styles.cellStyle}>
              {convertToTime(millisecondsToTime(ele.cumulativeTotal))}
            </td>
            <td style={styles.cellStyle}>
              <input value={ele.note} onChange={(e) => updateNote(index, e.target.value)} />
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
