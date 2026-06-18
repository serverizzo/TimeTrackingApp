import React from 'react'
import StartStopMenu from './startstopmenu/startstopmenu'
import LapDisplay from './lapdisplay/lapdisplay'
import CollapseableTimeDisplay from './collapseabletimedisplay/collapseabletimedisplay'

export default function MainRoute() {
  return (
    <div style={{ border: '2px', borderColor: '#7c7c7c31', borderStyle: 'solid', borderRadius: 4 }}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          border: '2px',
          borderColor: '#7c7c7c31',
          borderStyle: 'solid'
        }}
      >
        <StartStopMenu />
        <LapDisplay />
      </div>
      <div>
        <CollapseableTimeDisplay />
      </div>
    </div>
  )
}
