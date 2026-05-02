import React, { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'

export default function NotesPannel() {
  const [notes, setNotes] = useState<string>()

  useEffect(() => {
    window.api.getNotes().then((res) => {
      console.log(res)
      setNotes(res)
    })
  }, [])

  return (
    <div>
      {/* <style>
        {`
          .scroll_enabled {
              overflow-y: scroll;
              height: 500px;
            }

            .scroll_enabled::-webkit-scrollbar {
              width: 6px;
            }

            .scroll_enabled::-webkit-scrollbar-track {
              background: transparent;
            }

            .scroll_enabled::-webkit-scrollbar-thumb {
              background-color: #444;
              border-radius: 6px;
            }

            .scroll_enabled::-webkit-scrollbar-thumb:hover {
              background-color: #666;
            }
        `}
      </style> */}
      <p style={{ fontSize: 13, color: 'grey', marginBottom: 8 }}>Journal</p>
      {/* <pre className="scroll_enabled">{notes}</pre> */}
      <div className="scroll_enabled">
        <ReactMarkdown>{notes}</ReactMarkdown>
      </div>
    </div>
  )
}
