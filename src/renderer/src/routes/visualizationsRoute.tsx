import PanelResizeIcon from '@renderer/assets/icons/dragIcon'
import GanttChart from '@renderer/components/visualizations/GanttChart'
import Heatmap from '@renderer/components/visualizations/Heatmap'
import Linechart from '@renderer/components/visualizations/linechart'
import NotesPannel from '@renderer/components/visualizations/NotesPannel'
import PiechartComponent from '@renderer/components/visualizations/piechartcomponent'
import SummaryPanel from '@renderer/components/visualizations/summaryPannel'
import { LapEntry } from '@renderer/components/visualizations/types'
import { JSX, useEffect, useRef, useState } from 'react'
import { CheckinItemByDay } from 'src/shared/queryTypes/checkinItemByDay'
import { HeatmapDataByDayAndCalendar } from 'src/shared/queryTypes/heatmapByDayAndCalendar'

export default function VisualizationsRoute(): JSX.Element {
  const [heatmapData, setHeatmapData] = useState<HeatmapDataByDayAndCalendar[]>([])
  const [checkinItems, setCheckinItems] = useState<CheckinItemByDay[]>([])
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

  const handleMouseDown = (): void => {
    isDragging.current = true
  }

  const handleMouseMove = (e: React.MouseEvent): void => {
    if (!isDragging.current || !containerRef.current) return
    const containerLeft = containerRef.current.getBoundingClientRect().left
    const newWidth = e.clientX - containerLeft
    if (newWidth > 200 && newWidth < 800) {
      setCalendarWidth(newWidth)
    }
  }

  const handleMouseUp = (): void => {
    isDragging.current = false
  }

  useEffect(() => {
    if (!calendarRef.current) return

    const observer = new ResizeObserver(() => {
      if (calendarRef.current) {
        setCalendarHeight(calendarRef.current.offsetHeight)
      }
    })

    observer.observe(calendarRef.current)
    return () => observer.disconnect()
  }, []) // no dependency needed — ResizeObserver handles all size changes

  const formatDate = (d: Date) => d.toISOString().split('T')[0] // TODO: fix this!!

  const windowEnd = new Date(windowStart)
  windowEnd.setDate(windowStart.getDate() + 6)

  useEffect(() => {
    const getData = async (): Promise<void> => {
      const heatMapData = await window.api.getHeatmapData()
      setHeatmapData(heatMapData.heatmapDataByDayAndCalendarArr)
      setCheckinItems(heatMapData.checkinItemByDayArr)
    }
    getData()
  }, [])

  useEffect(() => {
    window.api.getLapsByRange(formatDate(windowStart), formatDate(windowEnd)).then(setLaps)
  }, [windowStart, ganttRefresh])

  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [laps])

  return (
    <div
      className="scroll_enabled"
      style={{
        width: '100vw',
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
          <Heatmap heatmapInput={heatmapData} checkinItems={checkinItems} />
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
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <PanelResizeIcon size={32} style={{ flexShrink: 0, zIndex: 10 }} />
        </div>

        <div
          ref={scrollRef}
          className="scroll_enabled"
          style={{
            flex: 1,
            height: calendarHeight,
            overflowY: 'auto',
            paddingRight: 5
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
      {/* <SummaryPanel laps={laps} /> */}
      <Linechart />

      <PiechartComponent />
    </div>
  )
}
