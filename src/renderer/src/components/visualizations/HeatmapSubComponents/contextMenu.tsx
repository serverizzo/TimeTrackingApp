import React from 'react'

export default function ContextMenu({
  x,
  y,
  date,
  closeMenu,
  openCheckinModal
}: {
  x: number
  y: number
  date: string
  closeMenu: () => void
  openCheckinModal: (date: string) => void
}) {
  return (
    <div
      style={{
        position: 'fixed',
        top: y,
        left: x,
        background: 'white',
        border: '0.5px solid grey',
        borderRadius: 4,
        padding: '4px 0',
        zIndex: 1000,
        minWidth: 160
      }}
      onMouseLeave={closeMenu}
    >
      <div
        style={{ padding: '8px 12px', fontSize: 13, color: 'gray', cursor: 'pointer' }}
        onClick={() => {
          console.log('Jump to', date)
        }}
      >
        {date}
      </div>
      <div
        style={{ padding: '8px 12px', fontSize: 12, color: 'grey', cursor: 'pointer' }}
        onClick={() => openCheckinModal(date)}
      >
        Update checkins
      </div>
      <hr style={{ margin: '4px 0', borderColor: 'rgba(128,128,128,0.2)' }} />
      {/* <div
        style={{ padding: '8px 12px', fontSize: 13, color: 'gray', cursor: 'pointer' }}
        onClick={() => {
          console.log('Jump to', date)
        }}
      >
        Jump to this week
      </div> */}
    </div>
  )
}
