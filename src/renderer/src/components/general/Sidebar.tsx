import { useStopwatch } from '@renderer/context/stopwatchcontext'
import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { LapRow } from 'src/shared/databasetypes/LapRow'
import { useNavigate } from 'react-router-dom'

export default function Sidebar() {
  const { saveToCSV, laps } = useStopwatch()
  const navigate = useNavigate()
  const [disableVisualizationButton, setDisableVisualizationButton] = useState(false)

  const saveToDatabase = async (laps: LapRow[]) => {
    console.log('clicked save to database')

    await toast.promise(window.api.insertLaps(laps), {
      loading: 'Saving...',
      success: 'Saved!',
      error: 'Error Saving'
    })
  }

  const navigateVisualizations = () => {
    navigate('/visualizations')
  }

  const navigateLapDisplay = () => {
    navigate('/')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <button onClick={saveToCSV}>Export as CSV</button>
      <button onClick={() => saveToDatabase(laps)}>Save to Database</button>
      <button onClick={navigateLapDisplay}>Lap Display</button>
      <button onClick={navigateVisualizations}>Visualizations</button>
      <button onClick={() => navigate('/journal')}>Journal</button>
    </div>
  )
}
