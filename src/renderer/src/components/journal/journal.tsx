import React, { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import toast from 'react-hot-toast'

type ViewMode = 'split' | 'edit' | 'preview'

export default function Journal() {
  const [notes, setNotes] = useState<string>('')
  const [mode, setMode] = useState<ViewMode>('split')

  useEffect(() => {
    window.api.getNotes().then(setNotes)
  }, [])

  const handleSave = () => {
    window.api.saveNotes(notes)
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100%',
        padding: '1rem',
        boxSizing: 'border-box'
      }}
    >
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center' }}>
        <button onClick={() => setMode('edit')}>Edit</button>
        <button onClick={() => setMode('split')}>Split</button>
        <button onClick={() => setMode('preview')}>Preview</button>
        <button onClick={handleSave}>Save</button>
        <div style={{ flex: 1 }} />
      </div>

      {/* Editor / Preview */}
      <div style={{ display: 'flex', flex: 1, gap: 16, overflow: 'hidden', width: '100%' }}>
        {/* Editor */}
        {(mode === 'edit' || mode === 'split') && (
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            style={{
              flex: 1,
              resize: 'none',
              fontFamily: 'monospace',
              fontSize: 13,
              lineHeight: 1.7,
              padding: '1rem',
              boxSizing: 'border-box',
              borderRadius: 8,
              border: '0.5px solid grey',
              background: 'transparent',
              color: 'inherit',
              outline: 'none'
            }}
          />
        )}

        {/* Divider */}
        {mode === 'split' && (
          <div style={{ width: 1, background: 'rgba(128,128,128,0.3)', flexShrink: 0 }} />
        )}

        {/* Preview */}
        {(mode === 'preview' || mode === 'split') && (
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '1rem',
              fontSize: 13,
              lineHeight: 1.7,
              boxSizing: 'border-box'
            }}
          >
            <ReactMarkdown>{notes}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  )
}
