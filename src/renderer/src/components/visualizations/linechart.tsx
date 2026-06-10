import React, { useEffect, useMemo, useState } from 'react'
import { LapEntry } from './types'
import { LinechartData } from 'src/shared/queryTypes/linechartData'
// import { RechartsDevtools } from '@recharts/devtools'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import { msToMins } from '@renderer/helperFunctions/date/date'

interface LinechartEntry {
  date: string
  total_time: number
}

export default function Linechart() {
  const [currLinechartData, setCurrLinechartData] = useState<LinechartEntry[]>([])
  const [rawLinechartData, setRawLinechartData] = useState<LinechartData[]>([])
  const [calendars, setCalendars] = useState<{ calendarName: string; calendarColor: string }[]>([])
  const [tasks, setTasks] = useState<string[]>([])
  const [allButton, setAllButton] = useState<boolean>(false)
  const [hoveredCalendar, setHoveredCalendar] = useState<string | null>(null)
  const [selectedCalendars, setSelectedCalendars] = useState<Map<string, string[]>>(new Map())

  // fetch linechart data
  useEffect(() => {
    const getData = async () => {
      const result: LinechartData[] = await window.api.getLineChartData()
      setRawLinechartData(result)
    }
    getData()
  }, [])

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
    setTasks(listArr)
  }, [rawLinechartData])

  const data = [
    {
      name: 'Page A',
      uv: 400,
      pv: 2400,
      amt: 2400
    },
    {
      name: 'Page B',
      uv: 300,
      pv: 4567,
      amt: 2400
    },
    {
      name: 'Page C',
      uv: 320,
      pv: 1398,
      amt: 2400
    },
    {
      name: 'Page D',
      uv: 200,
      pv: 9800,
      amt: 2400
    },
    {
      name: 'Page E',
      uv: 278,
      pv: 3908,
      amt: 2400
    },
    {
      name: 'Page F',
      uv: 189,
      pv: 4800,
      amt: 2400
    }
  ]

  const toggleLine = (lineName: string) => {
    setActiveLines((prev) =>
      prev.includes(lineName) ? prev.filter((entry) => entry !== lineName) : [...prev, lineName]
    )
  }

  const toggleCalendar = (calendarName: string) => {
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

  const toggleTask = (calendarName: string, taskName: string) => {
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      {/* chips row */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        {/* all chip */}
        <div
          style={styles.chip}
          onClick={() => setActiveLines([])}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#2e2e2e')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'unset')}
        >
          <div style={{ height: 15, width: 15, backgroundColor: '#c4c4c4', borderRadius: 10 }} />
          <p>All</p>
        </div>

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

      {/* chart */}
      <ResponsiveContainer width="90%" aspect={1.618}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#888888" />
          {activeLines.map((lineName) => {
            const calColor = calendars.find((c) => c.calendarName === lineName)?.calendarColor
            // for tasks, find which calendar they belong to
            const taskCalendar = Array.from(tasksByCalendar.entries()).find(([, tasks]) =>
              tasks.includes(lineName)
            )
            const color =
              lineName === 'total_time'
                ? '#c4c4c4'
                : (calColor ??
                  calendars.find((c) => c.calendarName === taskCalendar?.[0])?.calendarColor)
            return (
              <Line
                type="monotone"
                strokeWidth={2}
                stroke={color}
                key={lineName}
                dataKey={lineName}
                dot={false}
              />
            )
          })}
          <XAxis
            dataKey="date"
            tickFormatter={(date) => new Date(date + 'T00:00:00').toLocaleDateString()}
          />
          <YAxis label={{ value: 'Time (m)', angle: -90, position: 'insideLeft' }} />
          <Tooltip
            contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
            labelStyle={{ color: '#fff' }}
            itemStyle={{ color: '#ccc' }}
            labelFormatter={(label) => `Date: ${new Date(label + 'T00:00:00').toDateString()}`}
            formatter={(value, name) => [
              `${Math.floor(value / 60)}h ${value % 60}m (${value} mins)`,
              name
            ]}
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
    border: '1px solid white',
    borderRadius: 15,
    gap: 5,
    paddingLeft: 10,
    paddingRight: 10,
    cursor: 'pointer'
  }
}
