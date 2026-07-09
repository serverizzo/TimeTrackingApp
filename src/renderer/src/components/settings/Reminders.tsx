import { JSX, useEffect, useState } from 'react'
import Tooltips from '../activities/Tooltips'
import InfoIcon from '@renderer/assets/icons/infoIcon'

export default function Reminders(): JSX.Element {
  const [inputTimeMinutes, setInputTimeMinutes] = useState<number>(20)
  const [executeFlashError, setExecuteFlashError] = useState<string | undefined>(undefined)
  const [returnedAlarmTime, setReturnedAlarmTime] = useState<string | null>()
  const [enabled, setEnabled] = useState<boolean>(false)
  const [toolTipReminders, setTooltipReminders] = useState<{ xPos: number; yPos: number } | null>(null)

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

  const updateSettings = (check: boolean): void => {
    setEnabled(check)
    if (check == false) {
      window.api.disableRepeatNotifications()
    }
    if (check == true) {
      executeFlash()
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'row', gap: 10 }}>
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => updateSettings(e.target.checked)}
        />
        <div 
          onMouseEnter={(e) => setTooltipReminders({ xPos: e.clientX, yPos: e.clientY })}
          onMouseLeave={() => setTooltipReminders(null)}
        style={{display:'flex', flexDirection:'row', alignItems: 'center', gap: 10}}>
          <h2>Enable reminders</h2>
          <InfoIcon size={20} />
        </div>
        {toolTipReminders && (
            <Tooltips
              xPos={toolTipReminders.xPos}
              yPos={toolTipReminders.yPos}
              offset={12}
              message={<div>
                <p>If you are using this on windows 11, you can enable/disable popup notifications and sounds by going to</p>
                <p>System &gt; Notifications (and ensure that it is turned on)</p>
                </div> 
                }
            />
          )}
      </div>

      <div
        style={{
          paddingLeft: '40px',
          opacity: enabled ? 1 : 0.4
          // pointerEvents: enabled ? 'auto' : 'none',
          // cursor: enabled ? 'none' : 'not-allowed'
        }}
      >
        <p>
          Remind me that my app is running every
          <input
            style={{ width: 60, marginLeft: 10, marginRight: 10 }}
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
