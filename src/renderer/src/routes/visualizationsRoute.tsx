import { useEffect, useState } from 'react'

interface HeatmapEntry {
  date: string
  total: number
}

interface LapEntry {
  timestarted: string
  date: string
  lap_time: number
  note: string
}

export default function VisualizationsRoute() {
  const [heatmapData, setHeatmapData] = useState<HeatmapEntry[]>([])
  const [laps, setLaps] = useState<LapEntry[]>([])
  const [windowStart, setWindowStart] = useState<Date>(() => {
    const d = new Date()
    d.setDate(d.getDate() - 6)
    return d
  })

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
    <div>
      <p>VisualizationsRoute</p>
      <p>{heatmapData.length} days of data loaded</p>
      <p>{laps.length} laps in current window</p>
    </div>
  )
}
