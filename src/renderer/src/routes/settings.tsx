import AutoStart from '@renderer/components/settings/AutoStart'
import Reminders from '@renderer/components/settings/Reminders'
import { JSX, useEffect, useState } from 'react'

export default function Settings(): JSX.Element {
  const [version, setVersion] = useState<string>('')
  const [newRelease, setNewRelease] = useState<boolean>(false)
  const [newReleaseVersion, setNewReleaseVersion] = useState<string | null>('')

  useEffect(() => {
    const getTheCurrentVersion = async (): void => {
      const res = await window.api.checkForUpdates()
      setVersion(res.currentVersion)
      setNewRelease(res.updateAvailable)
      setNewReleaseVersion(res.latestVersion)
    }
    getTheCurrentVersion()
  }, [])

  return (
    <div style={{ paddingLeft: '10px' }}>
      <Reminders />
      <AutoStart />
      <div style={{ paddingTop: '20px' }}>
        <p>Current Version: {version} </p>
        {!newRelease && (
          <button onClick={() => window.api.openRelasePages()}>
            You are on the latest release
          </button>
        )}
        {newRelease && (
          <button onClick={() => window.api.openRelasePages()}>
            New update: {newReleaseVersion}
          </button>
        )}
      </div>
    </div>
  )
}
