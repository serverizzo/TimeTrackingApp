import React, { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import toast from 'react-hot-toast'
import CodeMirror from '@uiw/react-codemirror'
import { markdown } from '@codemirror/lang-markdown'
import { oneDark } from '@codemirror/theme-one-dark'
import { history, historyField } from '@codemirror/commands'
import { EditorState } from '@codemirror/state'

type ViewMode = 'split' | 'edit' | 'preview'

export default function Journal() {
  const [notes, setNotes] = useState<string>('') // the one currently being rendered
  // const [draft, setDraft] = useState<string | null>('')
  const [savedNotes, setSavedNotes] = useState<string>('')
  const [mode, setMode] = useState<ViewMode>('split')
  const saveStateDebounced = useRef<NodeJS.Timeout | null>(null)

  const isDirty = notes !== savedNotes

  useEffect(() => {
    const loadNotes = async () => {
      const draft = await window.api.getDraft()
      const saved = await window.api.getNotes()
      setNotes(saved)
      setSavedNotes(saved)

      console.log('draft:', draft)
      console.log('saved:', saved)

      if (draft !== null && draft !== '' && draft !== saved) {
        setNotes(draft)
        toast('Unsaved changes restored from last session', { icon: '⚠️' })
      } else {
        setNotes(saved)
      }
    }
    loadNotes()
  }, [])

  // write to draft if dirty, use debounce to prevent multiple writes
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (isDirty) window.api.saveDraft(notes)
    }, 1000)
    return () => clearTimeout(debounceTimer)
  }, [notes])

  const handleSave = async () => {
    await toast.promise(window.api.saveNotes(notes), {
      loading: 'Saving...',
      success: 'Saved!',
      error: 'Error saving'
    })
    setSavedNotes(notes)
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
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center' }}>
        <button onClick={() => setMode('edit')}>Edit</button>
        <button onClick={() => setMode('split')}>Split</button>
        <button onClick={() => setMode('preview')}>Preview</button>
        <button onClick={handleSave}>Save</button>
        <span style={{ fontSize: 12, color: isDirty ? 'orange' : 'grey' }}>
          {isDirty ? '● unsaved changes' : '● saved'}
        </span>
        <div style={{ flex: 1 }} />
      </div>

      <div style={{ display: 'flex', flex: 1, gap: 16, overflow: 'hidden', width: '100%' }}>
        {(mode === 'edit' || mode === 'split') && (
          <div
            style={{
              flex: 1,
              minWidth: 0,
              overflow: 'hidden',
              borderRadius: 8,
              border: '0.5px solid grey'
            }}
          >
            <CodeMirror
              value={notes}
              height="100%"
              extensions={[markdown(), history()]}
              theme={oneDark}
              onChange={(value) => setNotes(value)}
              style={{ height: '100%', fontSize: 13 }}
              onCreateEditor={async (view) => {
                const savedState = await window.api.getEditorState()
                if (savedState) {
                  const state = EditorState.fromJSON(
                    JSON.parse(savedState),
                    { extensions: [markdown(), history()] },
                    { history: historyField }
                  )
                  view.setState(state)
                }
              }}
              onUpdate={(viewUpdate) => {
                if (saveStateDebounced.current) clearTimeout(saveStateDebounced.current)
                saveStateDebounced.current = setTimeout(() => {
                  const serialized = viewUpdate.state.toJSON({ history: historyField })
                  window.api.saveEditorState(JSON.stringify(serialized))
                }, 500)
              }}
            />
          </div>
        )}

        {mode === 'split' && (
          <div style={{ width: 1, background: 'rgba(128,128,128,0.3)', flexShrink: 0 }} />
        )}

        {(mode === 'preview' || mode === 'split') && (
          <div
            style={{
              flex: 1,
              minWidth: 0,
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
