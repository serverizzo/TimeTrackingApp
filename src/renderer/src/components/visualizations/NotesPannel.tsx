import React, { useEffect, useState } from 'react'

export default function NotesPannel() {
  const [notes, setNotes] = useState<string>()

  useEffect(() => {
    window.api.getNotes().then((res) => {
      console.log(res)
      setNotes(res)
    })
  }, [])

  return (
    <div style={{ flex: 1, padding: '1rem' }}>
      <p style={{ fontSize: 13, color: 'grey', marginBottom: 8 }}>Journal</p>
      <pre
        style={{
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          fontSize: 13,
          lineHeight: 1.7,
          margin: 0
        }}
      >
        {notes}
      </pre>
    </div>
  )
}
