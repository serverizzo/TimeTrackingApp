import { useStopwatch } from '@renderer/context/stopwatchcontext'
import React from 'react'
import { LapRow } from 'src/shared/databasetypes/LapRow'

export default function Sidebar() {
  const { saveToCSV, laps } = useStopwatch()

  const saveToDatabase = async (laps: LapRow[]) => {
    console.log('clicked save to database')

    await window.api.insertLaps(laps)
  }

  return (
    <div style={styles.tempColor}>
      Sidebar
      <button onClick={saveToCSV}>Export as CSV</button>
      <button onClick={() => saveToDatabase(laps)}>Save to Database</button>
    </div>
  )
}

const styles = {
  tempColor: {
    color: 'red'
  }
}
