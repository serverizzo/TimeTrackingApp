import { useStopwatch } from '@renderer/context/stopwatchcontext'
import React from 'react'

export default function StartStopMenu() {
  const { start, stop } = useStopwatch()

  const executeStart = () => {
    console.log('start has been pressed')
    start()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <button onClick={() => executeStart()} style={styles.buttonStyles}>
        Start
      </button>
      <button onClick={() => stop()} style={styles.buttonStyles}>
        Stop
      </button>
      <button onClick={() => console.log('I have been pressed')} style={styles.buttonStyles}>
        Lap
      </button>
      <button onClick={() => console.log('I have been pressed')} style={styles.buttonStyles}>
        Restart
      </button>
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  buttonStyles: {
    // backgroundColor: '#646cff',
    // color: 'white',
    border: 'none',
    borderRadius: '3px',
    padding: '8px 16px',
    cursor: 'pointer',
    fontSize: '14px',
    textAlign: 'left'
  }
}
