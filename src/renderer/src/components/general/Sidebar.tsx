import { JSX } from 'react'

import { useNavigate } from 'react-router-dom'

export default function Sidebar(): JSX.Element {
  const navigate = useNavigate()

  const navigateVisualizations = (): void => {
    navigate('/visualizations')
  }

  const navigateLapDisplay = (): void => {
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

      <button onClick={() => navigate('/settings')}>Setting</button>
    </div>
  )
}
