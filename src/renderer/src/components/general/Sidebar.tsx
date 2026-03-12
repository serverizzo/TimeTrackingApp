import { useStopwatch } from '@renderer/context/stopwatchcontext'
import React from 'react'
import toast from 'react-hot-toast'
import { LapRow } from 'src/shared/databasetypes/LapRow'

export default function Sidebar() {
  const { saveToCSV, laps } = useStopwatch()

  const saveToDatabase = async (laps: LapRow[]) => {
    console.log('clicked save to database')

    await toast.promise(window.api.insertLaps(laps), {
      loading: 'Saving...',
      success: 'Saved!',
      error: 'Error Saving'
    })
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
