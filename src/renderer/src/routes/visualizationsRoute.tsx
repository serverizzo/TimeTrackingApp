import GanttChart from '@renderer/components/visualizations/GanttChart'
import Heatmap from '@renderer/components/visualizations/Heatmap'
import NotesPannel from '@renderer/components/visualizations/NotesPannel'
import SummaryPanel from '@renderer/components/visualizations/summaryPannel'
import { HeatmapEntry, LapEntry } from '@renderer/components/visualizations/types'
import { DebugStyles } from '@renderer/styles.ts/debugStyle'
import { useEffect, useRef, useState } from 'react'

export default function VisualizationsRoute() {
  const [heatmapData, setHeatmapData] = useState<HeatmapEntry[]>([])
  const [laps, setLaps] = useState<LapEntry[]>([])
  const [windowStart, setWindowStart] = useState<Date>(() => {
    const d = new Date()
    d.setDate(d.getDate() - 6)
    return d
  })
  const calendarRef = useRef<HTMLDivElement>(null)
  const [calendarHeight, setCalendarHeight] = useState<number>(0)

  useEffect(() => {
    if (calendarRef.current) {
      setCalendarHeight(calendarRef.current.offsetHeight)
    }
  }, [heatmapData])

  const formatDate = (d: Date) => d.toISOString().split('T')[0]

  const windowEnd = new Date(windowStart)
  windowEnd.setDate(windowStart.getDate() + 6)

  useEffect(() => {
    window.api.getHeatmapData().then(setHeatmapData)
  }, [])

  useEffect(() => {
    window.api.getLapsByRange(formatDate(windowStart), formatDate(windowEnd)).then(setLaps)
  }, [windowStart])

  return (
    <div
      style={{
        height: '100vh',
        overflowY: 'auto',
        paddingBottom: 100,
        paddingLeft: 10,
        paddingTop: 10,
        paddingRight: 120
      }}
    >
      <p>VisualizationsRoute</p>
      <div style={{ display: 'flex' }}>
        <div ref={calendarRef}>
          <Heatmap data={heatmapData} />
        </div>
        <div style={{ height: calendarHeight, overflowY: 'auto', paddingLeft: 20 }}>
          <NotesPannel />
        </div>
      </div>
      <GanttChart
        laps={laps}
        windowStart={windowStart}
        windowEnd={windowEnd}
        onPrev={() =>
          setWindowStart((prev) => {
            const d = new Date(prev)
            d.setDate(d.getDate() - 7)
            return d
          })
        }
        onNext={() =>
          setWindowStart((prev) => {
            const d = new Date(prev)
            d.setDate(d.getDate() + 7)
            return d
          })
        }
      />
      <SummaryPanel laps={laps} />
    </div>
  )
}
