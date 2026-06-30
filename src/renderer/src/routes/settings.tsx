import { JSX, useEffect, useState } from 'react'

export default function Settings(): JSX.Element {
  const [inputTimeMinutes, setInputTimeMinutes] = useState<number>(20)
  const [executeFlashError, setExecuteFlashError] = useState<string | undefined>(undefined)
  const [returnedAlarmTime, setReturnedAlarmTime] = useState<string | null>()
  const [enabled, setEnabled] = useState<boolean>(false)

  const executeFlash = (): void => {
    if (inputTimeMinutes == 0) {
      setExecuteFlashError('Time must be nonzero')
    } else {
      window.api.flashWindow(inputTimeMinutes * 60 * 1000).then((res) => setReturnedAlarmTime(res))
    }
  }

  useEffect(() => {
    const getNotificationTime = async (): Promise<void> => {
      const alarmTime = await window.api.getNextNotificationTime()
      setReturnedAlarmTime(alarmTime)
      if (alarmTime) {
        setEnabled(true)
      }
    }
    getNotificationTime()
  }, [])

  return (
    <div>
      <label>
        <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
        Enable reminders
      </label>
      <div
        style={{
          opacity: enabled ? 1 : 0.4
          // pointerEvents: enabled ? 'auto' : 'none',
          // cursor: enabled ? 'none' : 'not-allowed'
        }}
      >
        <p>
          Remind me that my app is running every
          <input
            style={{ width: 60 }}
            placeholder={'20'}
            value={inputTimeMinutes}
            onChange={(e) => {
              if (isNaN(Number(e.target.value))) {
                setExecuteFlashError('Input must be a number')
              } else {
                setExecuteFlashError(undefined)
                setInputTimeMinutes(Number(e.target.value))
              }
            }}
          />
          minutes
        </p>
        {executeFlashError && <p style={{ color: 'red' }}>{executeFlashError}</p>}
        {returnedAlarmTime && <p>Next alarm at {returnedAlarmTime}</p>}
        <button onClick={() => executeFlash()}>Update</button>
      </div>
    </div>
  )
}
