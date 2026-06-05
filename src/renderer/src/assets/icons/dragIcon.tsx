import React from 'react'

export default function PanelResizeIcon({
  size,
  style
}: {
  size: number
  style?: React.CSSProperties
}) {
  const color = '#525252'

  return (
    <svg
      width={size}
      height={size}
      style={style}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <line x1="8" y1=".5" x2="8" y2="300" stroke="#525252" strokeWidth="1" strokeLinecap="round" />
      {/* <circle cx="8" cy="5" r="1" fill={color} />
      <circle cx="8" cy="8" r="1" fill={color} />
      <circle cx="8" cy="11" r="1" fill={color} /> */}
    </svg>
  )
}
