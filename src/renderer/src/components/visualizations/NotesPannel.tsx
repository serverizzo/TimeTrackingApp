import React, { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Timeline from './NotesPannelSubComponents/Timeline'
import { HeatmapData } from 'src/shared/queryTypes/heatMapData'

export default function NotesPannel() {
  const [notes, setNotes] = useState<string>()
  const previewRef = useRef<HTMLDivElement>(null)
  const [notePannelView, setNotePannelView] = useState<string>('Timeline')

  useEffect(() => {
    window.api.getNotes().then((res) => {
      setNotes(res)

      requestAnimationFrame(() => {
        if (previewRef.current) {
          previewRef.current.scrollTop = previewRef.current.scrollHeight
        }
      })
    })
  }, [])

  return (
    <div>
      {/* Button tabs */}
      <div
        style={{
          display: 'flex',
          gap: 5,
          position: 'sticky',
          top: 0,
          backgroundColor: '#1e1e1e',
          paddingBottom: 10
        }}
      >
        <div
          onMouseEnter={(e) => (e.currentTarget.style.background = '#4a4a4a')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#383838')}
          style={{ ...styles.tabStyles }}
          onClick={() => setNotePannelView('Timeline')}
        >
          <p>Timeline</p>
        </div>
        <div
          onMouseEnter={(e) => (e.currentTarget.style.background = '#4a4a4a')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#383838')}
          style={{ ...styles.tabStyles }}
          onClick={() => setNotePannelView('Journal')}
        >
          <p>Journal</p>
        </div>
      </div>

      <div>
        {notePannelView === 'Timeline' && (
          <div>
            <Timeline />
          </div>
        )}
        {notePannelView === 'Journal' && (
          <div ref={previewRef} className="scroll_enabled">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{notes}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  tabStyles: {
    // background:'white'
    backgroundColor: '#383838',
    cursor: 'pointer',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    padding: 5,
    paddingLeft: 10,
    paddingRight: 10
  }
}
