import { useStopwatch } from '@renderer/context/stopwatchcontext'
import React, { useState } from 'react'

import { useNavigate } from 'react-router-dom'

export default function Sidebar() {
  const navigate = useNavigate()
  const [disableVisualizationButton, setDisableVisualizationButton] = useState(false)

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
    </div>
  )
}
