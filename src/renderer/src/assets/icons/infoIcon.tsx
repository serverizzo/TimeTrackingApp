import React from 'react'

export default function InfoIcon({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="8" cy="8" r="7" stroke="#6B7280" stroke-width="1.5" />
      <circle cx="8" cy="5.5" r="1" fill="#6B7280" />
      <line
        x1="8"
        y1="8"
        x2="8"
        y2="12"
        stroke="#6B7280"
        stroke-width="1.5"
        stroke-linecap="round"
      />
    </svg>
  )
}
