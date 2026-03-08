import { useStopwatch } from '@renderer/context/stopwatchcontext'
import React from 'react'

export default function Sidebar() {
  const { saveToCSV } = useStopwatch()
  return (
    <div style={styles.tempColor}>
      Sidebar
      <button onClick={saveToCSV}>Export</button>
    </div>
  )
}

const styles = {
  tempColor: {
    color: 'red'
  }
}
