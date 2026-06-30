import { JSX, useEffect, useState } from 'react'

export default function AutoStart(): JSX.Element {
  const [enabled, setEnabled] = useState<boolean>(false)

  useEffect(() => {
    window.api.getLaunchOnStartup().then(setEnabled)
  }, [])

  const handleToggle = async (): Promise<void> => {
    const newValue = !enabled
    await window.api.setLaunchOnStartup(newValue)
    setEnabled(newValue)
  }

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'row', gap: 10 }}>
        <input type="checkbox" checked={enabled} onChange={(e) => handleToggle(e.target.checked)} />
        <h2>Enable start on launch</h2>
      </div>
      <div
        style={{
          paddingLeft: '40px',
          opacity: enabled ? 1 : 0.4
          // pointerEvents: enabled ? 'auto' : 'none',
          // cursor: enabled ? 'none' : 'not-allowed'
        }}
      >
        {enabled && <p>Autostart enabled</p>}
        {!enabled && <p>Autostart disabled</p>}
      </div>

      <div
        style={{
          paddingLeft: '40px',
          opacity: enabled ? 1 : 0.4
          // pointerEvents: enabled ? 'auto' : 'none',
          // cursor: enabled ? 'none' : 'not-allowed'
        }}
      ></div>
    </div>
  )
}
