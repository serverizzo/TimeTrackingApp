import { useStopwatch } from '@renderer/context/stopwatchcontext'
import React from 'react'
import toast from 'react-hot-toast'
import { LapRow } from 'src/shared/databasetypes/LapRow'

export default function StartStopMenu() {
  const { start, stop, clear, isTimerRunning, lap, laps, saveToCSV } = useStopwatch()

  const executeStart = () => {
    console.log('start has been pressed')
    start()
  }

  const saveToDatabase = async (laps: LapRow[]) => {
    console.log('clicked save to database')

    await toast.promise(window.api.insertLaps(laps), {
      loading: 'Saving...',
      success: 'Saved!',
      error: 'Error Saving'
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <button
        // disabled={isTimerRunning}
        onClick={() => executeStart()}
        style={styles.buttonStyles}
      >
        Start
      </button>
      <button onClick={() => saveToDatabase(laps)} style={styles.buttonStyles}>
        Save
      </button>
      <button disabled={!isTimerRunning} onClick={() => stop()} style={styles.buttonStyles}>
        Stop
      </button>
      <button disabled={!isTimerRunning} onClick={() => lap()} style={styles.buttonStyles}>
        Lap
      </button>
      <button onClick={saveToCSV} style={styles.buttonStyles}>
        Export
      </button>
      <button disabled={isTimerRunning} onClick={() => clear()} style={styles.buttonStyles}>
        Clear
      </button>
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  buttonStyles: {
    // backgroundColor: '#646cff',
    // color: 'white',
    border: 'none',
    borderRadius: '6px',
    padding: '8px 16px',
    cursor: 'pointer',
    fontSize: '14px',
    textAlign: 'left',
    paddingBottom: '10px'
    // marginBottom: '1px'
  }
}
