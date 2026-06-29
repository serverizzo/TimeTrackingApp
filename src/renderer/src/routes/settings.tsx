import { JSX, useState } from 'react'

export default function Settings(): JSX.Element {
  const [inputTimeMinutes, setInputTimeMinutes] = useState<number>(20)
  const [executeFlashError, setExecuteFlashError] = useState<string | undefined>(undefined)
  const executeFlash = (): void => {
    window.api.flashWindow(inputTimeMinutes)
  }

  return (
    <div>
      <p>
        Remind me that my app is still running every
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
      <button onClick={() => executeFlash()}>Update</button>
    </div>
  )
}
