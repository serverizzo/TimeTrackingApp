import GanttChart from '@renderer/components/visualizations/GanttChart'
import Heatmap from '@renderer/components/visualizations/Heatmap'
import NotesPannel from '@renderer/components/visualizations/NotesPannel'
import SummaryPanel from '@renderer/components/visualizations/summaryPannel'
import { LapEntry } from '@renderer/components/visualizations/types'
import { useEffect, useRef, useState } from 'react'
import { HeatmapDataByDayAndCalendar } from 'src/shared/queryTypes/heatmapByDayAndCalendar'
import { HeatmapData } from 'src/shared/queryTypes/heatMapData'

export default function VisualizationsRoute() {
  const [heatmapData, setHeatmapData] = useState<HeatmapDataByDayAndCalendar[]>([])
  const [laps, setLaps] = useState<LapEntry[]>([])
  const [windowStart, setWindowStart] = useState<Date>(() => {
    const d = new Date()
    d.setDate(d.getDate() - 6)
    return d
  })
  const calendarRef = useRef<HTMLDivElement>(null)
  const [calendarHeight, setCalendarHeight] = useState<number>(0)
  const [calendarWidth, setCalendarWidth] = useState<number>(500)
  const isDragging = useRef<boolean>(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const [ganttRefresh, setGanttRefresh] = useState<boolean>(false)

  const handleMouseDown = () => {
    isDragging.current = true
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !containerRef.current) return
    const containerLeft = containerRef.current.getBoundingClientRect().left
    const newWidth = e.clientX - containerLeft
    if (newWidth > 200 && newWidth < 800) {
      setCalendarWidth(newWidth)
    }
  }

  const handleMouseUp = () => {
    isDragging.current = false
  }

  useEffect(() => {
    if (calendarRef.current) {
      setCalendarHeight(calendarRef.current.offsetHeight)
    }
  }, [heatmapData])

  const formatDate = (d: Date) => d.toISOString().split('T')[0]

  const windowEnd = new Date(windowStart)
  windowEnd.setDate(windowStart.getDate() + 6)

  useEffect(() => {
    const getData = async () => {
      const heatMapData = await window.api.getHeatmapData()
      console.log(heatMapData)
      setHeatmapData(heatMapData.heatmapDataByDayAndCalendarArr)
    }
    getData()
  }, [])

  useEffect(() => {
    window.api.getLapsByRange(formatDate(windowStart), formatDate(windowEnd)).then(setLaps)
  }, [windowStart, ganttRefresh])

  return (
    <div
      className="scroll_enabled"
      style={{
        height: '100vh',
        overflowY: 'auto',
        paddingBottom: 100,
        paddingLeft: 10,
        paddingTop: 10,
        paddingRight: 10
      }}
    >
      <p>VisualizationsRoute</p>

      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ display: 'flex', alignItems: 'flex-start', gap: 0 }}
      >
        <div ref={calendarRef} style={{ width: calendarWidth, flexShrink: 0 }}>
          <Heatmap heatmapInput={heatmapData} />
        </div>

        {/* adjustable bar */}
        <div
          onMouseDown={handleMouseDown}
          style={{
            width: 6,
            cursor: 'col-resize',
            background: 'rgba(128,128,128,0.2)',
            alignSelf: 'stretch',
            borderRadius: 3,
            margin: '0 4px',
            flexShrink: 0
          }}
        />

        <div
          style={{
            flex: 1,
            height: calendarHeight,
            overflowY: 'auto',
            paddingLeft: 20
          }}
        >
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
