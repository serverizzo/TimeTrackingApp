import { useStopwatch } from '@renderer/context/stopwatchcontext'
import { ipcMain } from 'electron'
import React, { useEffect, useState } from 'react'

import { useNavigate } from 'react-router-dom'

export default function Sidebar() {
  const navigate = useNavigate()
  const [disableVisualizationButton, setDisableVisualizationButton] = useState(false)
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    window.api.getLaunchOnStartup().then(setEnabled)
  }, [])

  const handleToggle = async () => {
    const newValue = !enabled
    await window.api.setLaunchOnStartup(newValue)
    setEnabled(newValue)
  }

  const navigateVisualizations = () => {
    navigate('/visualizations')
  }

  const navigateLapDisplay = () => {
    navigate('/')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <button onClick={navigateLapDisplay}>Lap Display</button>
      <button onClick={navigateVisualizations}>Visualizations</button>
      <button onClick={() => navigate('/journal')}>Journal</button>
      <button onClick={() => navigate('/activities')}>Activities</button>
      {/* <button onClick={() => navigate('/syncToCloud')}>Sync to cloud</button> */}
      <button onClick={() => window.api.openRelasePages()}>Relase Page</button>
      {enabled && <button onClick={() => handleToggle()}>Disable launch on start</button>}
      {!enabled && <button onClick={() => handleToggle()}>Enable launch on start</button>}
    </div>
  )
}
