import React, { useEffect, useMemo, useState } from 'react'
import { LinechartData } from 'src/shared/queryTypes/linechartData'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'

interface LinechartEntry {
  date: string
  total_time: number
}

interface Calendar {
  calendarName: string
  calendarColor: string
}

export default function Linechart() {
  const [rawLinechartData, setRawLinechartData] = useState<LinechartData[]>([])
  const [selectedCalendars, setSelectedCalendars] = useState<string[]>([])

  useEffect(() => {
    const getData = async () => {
      const result: LinechartData[] = await window.api.getLineChartData()
      setRawLinechartData(result)
    }
    getData()
  }, [])

  const calendars: Calendar[] = useMemo(() => {
    const seen = new Map<string, string>()
    rawLinechartData.forEach((row) => {
      if (!seen.has(row.calendarName)) seen.set(row.calendarName, row.calendarColor)
    })
    return Array.from(seen, ([calendarName, calendarColor]) => ({ calendarName, calendarColor }))
  }, [rawLinechartData])

  const currLinechartData: LinechartEntry[] = useMemo(() => {
    const filtered =
      selectedCalendars.length === 0
        ? rawLinechartData
        : rawLinechartData.filter((row) => selectedCalendars.includes(row.calendarName))

    const grouped = new Map<string, number>()
    filtered.forEach((row) => {
      const current = grouped.get(row.date) ?? 0
      grouped.set(row.date, current + Math.round(row.lap_time / 60000))
    })

    return Array.from(grouped, ([date, total_time]) => ({ date, total_time }))
  }, [rawLinechartData, selectedCalendars])

  const toggleCalendar = (name: string) => {
    setSelectedCalendars((prev) =>
      prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]
    )
  }

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(date + 'T00:00:00'))
  }

  return (
    <div>
      {/* filter chips */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        <div
          style={{
            ...styles.chip,
            borderColor: selectedCalendars.length === 0 ? '#fff' : '#555'
          }}
          onClick={() => setSelectedCalendars([])}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#2e2e2e')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'unset')}
        >
          <div style={{ ...styles.dot, backgroundColor: '#c4c4c4' }} />
          <p>All</p>
        </div>

        {calendars.map((calendar) => (
          <div
            key={calendar.calendarName}
            style={{
              ...styles.chip,
              borderColor: selectedCalendars.includes(calendar.calendarName) ? '#fff' : '#555'
            }}
            onClick={() => toggleCalendar(calendar.calendarName)}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#2e2e2e')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'unset')}
          >
            <div style={{ ...styles.dot, backgroundColor: calendar.calendarColor }} />
            <p>{calendar.calendarName}</p>
          </div>
        ))}
      </div>

      {/* chart */}
      <ResponsiveContainer width="100%" aspect={1.618}>
        <LineChart data={currLinechartData}>
          <CartesianGrid />
          <Line dataKey="total_time" />
          <XAxis dataKey="date" tickFormatter={formatDate} />
          <YAxis label={{ value: 'Time (m)', angle: -90, position: 'insideLeft' }} />
          <Tooltip
            contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
            labelStyle={{ color: '#fff' }}
            itemStyle={{ color: '#ccc' }}
            labelFormatter={(label) => formatDate(label)}
            formatter={(value) => [`${value} mins`, 'Total Time']}
          />
          <Legend />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  chip: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    border: '1px solid',
    borderRadius: 15,
    gap: 5,
    paddingLeft: 10,
    paddingRight: 10,
    cursor: 'pointer',
    transition: 'background 0.15s'
  },
  dot: {
    height: 15,
    width: 15,
    borderRadius: 10,
    flexShrink: 0
  }
}
