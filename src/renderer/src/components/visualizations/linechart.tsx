import React, { JSX, useEffect, useMemo, useRef, useState } from 'react'
import { LinechartData } from 'src/shared/queryTypes/linechartData'
// import { RechartsDevtools } from '@recharts/devtools'
import {
  CartesianGrid,
  Legend,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  LabelList
} from 'recharts'

export default function Linechart(): JSX.Element {
  const [rawLinechartData, setRawLinechartData] = useState<LinechartData[]>([])
  const [calendars, setCalendars] = useState<{ calendarName: string; calendarColor: string }[]>([])
  const [hoveredCalendar, setHoveredCalendar] = useState<string | null>(null)
  const [selectedCalendars, setSelectedCalendars] = useState<Map<string, string[]>>(new Map())
  const [dateString, setDateString] = useState<string>('All Time')
  const [dateNumber, setDateNumber] = useState<number>(1)
  const presentedDate = useRef<string>('All Dates Shown')

  // fetch linechart data -- will run once on load
  useEffect(() => {
    let startDateStr: string | null = null

    if (dateString !== 'All Time') {
      const startDate = new Date()
      switch (dateString) {
        case 'Weeks':
          startDate.setDate(startDate.getDate() - dateNumber * 7)
          break
        case 'Months':
          startDate.setMonth(startDate.getMonth() - dateNumber)
          break
        case 'Years':
          startDate.setFullYear(startDate.getFullYear() - dateNumber)
          break
      }
      const pad = (n: number): string => String(n).padStart(2, '0')
      startDateStr = `${startDate.getFullYear()}-${pad(startDate.getMonth() + 1)}-${pad(startDate.getDate())}`
      presentedDate.current = startDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    }

    const getData = async (): Promise<void> => {
      const result: LinechartData[] = await window.api.getLineChartData(startDateStr)
      setRawLinechartData(result)
    }
    getData()
  }, [dateString, dateNumber])

  const chartData = useMemo(() => {
    // first pass - collect all keys
    const allCalendars = new Set<string>()
    const allNotes = new Set<string>()
    rawLinechartData.forEach((row) => {
      allCalendars.add(row.calendarName)
      allNotes.add(row.note)
    })

    // build the zero-initialized template
    const template: Record<string, number> = { total_time: 0 }
    allCalendars.forEach((c) => (template[c] = 0))
    allNotes.forEach((n) => (template[n] = 0))

    // second pass - group and sum
    const grouped = new Map<string, Record<string, number>>()
    rawLinechartData.forEach((row) => {
      if (!grouped.has(row.date)) grouped.set(row.date, { ...template }) // spread so each day gets its own copy
      const day = grouped.get(row.date)!
      day['total_time'] += Math.round(row.lap_time / 60000)
      day[row.calendarName] += Math.round(row.lap_time / 60000)
      day[row.note] += Math.round(row.lap_time / 60000)
    })

    return Array.from(grouped, ([date, values]) => ({ date, ...values }))
  }, [rawLinechartData])

  // createListOfCalendars and listOfTasks
  useEffect(() => {
    const calendarsArr: { calendarName: string; calendarColor: string }[] = []
    const calendarsSet = new Set()
    const listArr: string[] = []
    const listSet = new Set()
    for (const ele of rawLinechartData) {
      if (!calendarsSet.has(ele.calendarName)) {
        calendarsSet.add(ele.calendarName)
        calendarsArr.push({ calendarName: ele.calendarName, calendarColor: ele.calendarColor })
      }
      if (!listSet.has(ele.note)) {
        listSet.add(ele.note)
        listArr.push(ele.note)
      }
    }
    setCalendars(calendarsArr)
  }, [rawLinechartData])

  const toggleCalendar = (calendarName: string): void => {
    setSelectedCalendars((prev) => {
      const next = new Map(prev)
      if (next.has(calendarName)) {
        next.delete(calendarName)
      } else {
        next.set(calendarName, [])
      }
      return next
    })
  }

  const toggleTask = (calendarName: string, taskName: string): void => {
    setSelectedCalendars((prev) => {
      const next = new Map(prev)
      const tasks = next.get(calendarName) ?? []
      if (tasks.includes(taskName)) {
        next.set(
          calendarName,
          tasks.filter((t) => t !== taskName)
        )
      } else {
        next.set(calendarName, [...tasks, taskName])
      }
      return next
    })
  }

  const activeLines = useMemo(() => {
    if (selectedCalendars.size === 0) return ['total_time']

    const lines: string[] = []
    selectedCalendars.forEach((tasks, calendarName) => {
      if (tasks.length === 0) {
        lines.push(calendarName)
      } else {
        lines.push(...tasks)
      }
    })
    return lines
  }, [selectedCalendars])

  const tasksByCalendar = useMemo(() => {
    const map = new Map<string, string[]>()
    rawLinechartData.forEach((row) => {
      if (!map.has(row.calendarName)) map.set(row.calendarName, [])
      const tasks = map.get(row.calendarName)!
      if (!tasks.includes(row.note)) tasks.push(row.note)
    })
    return map
  }, [rawLinechartData])

  useEffect(() => {
    console.log(activeLines)
  }, [activeLines])

  const withAlpha = (color: string | undefined, alpha: number): string | undefined => {
    if (!color) return undefined
    const hex = Math.round(alpha * 255)
      .toString(16)
      .padStart(2, '0')
    return `${color}${hex}`
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      {/* chips row */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        {/* all chip */}

        {/* calendar chips */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          {/* top row - all + calendar chips */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <div
              style={{
                ...styles.chip,
                backgroundColor: selectedCalendars.size === 0 ? '#a3a3a3' : 'unset'
              }}
              onClick={() => setSelectedCalendars(new Map())}
              onMouseEnter={() => setHoveredCalendar('__all__')}
              onMouseLeave={() => setHoveredCalendar(null)}
            >
              <div
                style={{ height: 15, width: 15, backgroundColor: '#c4c4c4', borderRadius: 10 }}
              />
              <p>All</p>
            </div>

            {calendars.map((calendar) => {
              const isActive = selectedCalendars.has(calendar.calendarName)

              const isHovered = hoveredCalendar === calendar.calendarName
              return (
                <div
                  key={calendar.calendarName}
                  style={{
                    ...styles.chip,
                    backgroundColor: isActive ? '#a3a3a3' : isHovered ? '#2e2e2e' : 'unset'
                  }}
                  onClick={() => toggleCalendar(calendar.calendarName)}
                  onMouseEnter={() => setHoveredCalendar(calendar.calendarName)}
                  onMouseLeave={() => setHoveredCalendar(null)}
                >
                  <div
                    style={{
                      height: 15,
                      width: 15,
                      backgroundColor: calendar.calendarColor,
                      borderRadius: 10
                    }}
                  />
                  <p>{calendar.calendarName}</p>
                </div>
              )
            })}
          </div>

          {/* task chips - only show for expanded calendars */}
          {Array.from(selectedCalendars.entries()).map(([calendarName, selectedTasks]) => {
            const calendarColor = calendars.find(
              (c) => c.calendarName === calendarName
            )?.calendarColor
            const tasks = tasksByCalendar.get(calendarName) ?? []
            return (
              <div
                key={calendarName}
                style={{ display: 'flex', gap: 6, flexWrap: 'wrap', paddingLeft: 16 }}
              >
                <span style={{ color: '#888', fontSize: 12, alignSelf: 'center' }}>
                  {calendarName}:
                </span>
                {tasks.map((task) => {
                  const isActive = selectedTasks.includes(task)
                  return (
                    <div
                      key={task}
                      style={{
                        ...styles.chip,
                        fontSize: 12,
                        backgroundColor: isActive ? calendarColor : 'unset',
                        borderColor: calendarColor
                      }}
                      onClick={() => toggleTask(calendarName, task)}
                    >
                      <p>{task}</p>
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {/* Date range */}
        <p style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>DATE RANGE</p>
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          <p style={{ marginRight: 20, fontSize: 12, color: 'var(--color-text-tertiary)' }}>Last</p>
          <select
            onChange={(e) => setDateNumber(Number(e.target.value))}
            name={dateNumber.toString()}
            style={{ marginRight: 10 }}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((ele) => (
              <option key={ele}>{ele}</option>
            ))}
          </select>
          <select
            onChange={(e) => setDateString(e.target.value)}
            name={dateString}
            defaultValue={'All Time'}
          >
            {['Weeks', 'Months', 'Years', 'All Time'].map((ele) => (
              <option key={ele}>{ele}</option>
            ))}
          </select>
        </div>
        <div
          style={{
            fontSize: 12,
            color: 'var(--color-text-tertiary)',
            background: 'var(--color-background-secondary)',
            borderRadius: 8,
            border: '0.5px solid var(--color-border-tertiary)',
            display: 'inline-block'
          }}
        >
          {dateString === 'All Time'
            ? 'All Dates Shown'
            : `${presentedDate.current} — ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
        </div>
      </div>

      {/* chart */}
      <ResponsiveContainer width="90%" aspect={1.618}>
        <BarChart data={chartData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#888888" />
          {activeLines.map((lineName) => {
            const calColor = calendars.find((c) => c.calendarName === lineName)?.calendarColor
            const taskCalendar = Array.from(tasksByCalendar.entries()).find(([, tasks]) =>
              tasks.includes(lineName)
            )
            const color =
              lineName === 'total_time'
                ? '#c4c4c4'
                : (calColor ??
                  calendars.find((c) => c.calendarName === taskCalendar?.[0])?.calendarColor)
            return (
              <Bar key={lineName} dataKey={lineName} fill={withAlpha(color, 0.7)} strokeWidth={1}>
                <LabelList
                  dataKey={lineName}
                  position="inside"
                  content={({ x, y, width, height, value }) => {
                    if (!value || Number(value) === 0) return null
                    const label = `${Math.floor(Number(value) / 60)}h ${Number(value) % 60}m`
                    const cx = Number(x) + Number(width) / 2
                    const cy = Number(y) + Number(height) / 2
                    return (
                      <g>
                        <text
                          x={cx}
                          y={cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fontSize={11}
                          stroke="#000"
                          strokeWidth={3}
                          strokeLinejoin="round"
                        >
                          {label}
                        </text>
                        <text
                          x={cx}
                          y={cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fontSize={11}
                          fill="#fff"
                        >
                          {label}
                        </text>
                      </g>
                    )
                  }}
                />
              </Bar>
            )
          })}
          <XAxis
            type="number"
            label={{ value: 'Time (m)', position: 'insideBottom', offset: -5 }}
          />
          <YAxis
            type="category"
            dataKey="date"
            tickFormatter={(date) => new Date(date + 'T00:00:00').toLocaleDateString()}
            width={80}
          />
          <Tooltip
            contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
            labelStyle={{ color: '#fff' }}
            itemStyle={{ color: '#ccc' }}
            labelFormatter={(label) => `Date: ${new Date(label + 'T00:00:00').toDateString()}`}
            formatter={(value, name) => [
              `${Math.floor(Number(value) / 60)}h ${Number(value) % 60}m (${value} mins)`,
              name
            ]}
          />
          <Legend />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  chip: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    border: '1px solid white',
    borderRadius: 15,
    gap: 5,
    paddingLeft: 10,
    paddingRight: 10,
    cursor: 'pointer'
  }
}
