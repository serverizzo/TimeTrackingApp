import React from 'react'

export default function Tooltips({ xPos, yPos, offset, message }) {
  return (
    <div
      style={{
        position: 'fixed',
        top: yPos + offset,
        left: xPos + offset,
        background: '#1a1a1a',
        border: '0.5px solid rgba(114, 114, 114, 0.15)',
        borderRadius: 6,
        padding: '8px 12px',
        zIndex: '999'
      }}
    >
      <p>{message}</p>
    </div>
  )
}
