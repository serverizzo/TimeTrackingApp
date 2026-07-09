import { JSX, useEffect, useState } from 'react'

import { useNavigate } from 'react-router-dom'

export default function Sidebar(): JSX.Element {
  const navigate = useNavigate()
  const [isNewRelease, setIsNewRelease] = useState<boolean>(false)

  const navigateVisualizations = (): void => {
    navigate('/visualizations')
  }

  const navigateLapDisplay = (): void => {
    navigate('/')
  }

  useEffect(() => {
    const updateAvailable = async (): Promise<{
      latestVersion: string | null
      updateAvailable: boolean
      releaseUrl: string | null
      error?: string
    }> => {
      const res = await window.api.checkForUpdates()
      return res
    }
    updateAvailable().then((res) => setIsNewRelease(res.updateAvailable))
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <button onClick={navigateLapDisplay}>Lap Display</button>
      <button onClick={navigateVisualizations}>Visualizations</button>
      <button onClick={() => navigate('/journal')}>Journal</button>
      <button onClick={() => navigate('/activities')}>Activities</button>
      <button onClick={() => navigate('/syncToCloud')}>Sync to cloud</button>
      {!isNewRelease && <button onClick={() => window.api.openRelasePages()}>Release Page</button>}
      {isNewRelease && (
        <button onClick={() => window.api.openRelasePages()}>New Release Available</button>
      )}

      <button onClick={() => navigate('/settings')}>Setting</button>
    </div>
  )
}
