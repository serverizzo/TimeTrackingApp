import React, { JSX, useEffect, useMemo, useRef, useState } from 'react'
import { LinechartData } from 'src/shared/queryTypes/linechartData'
import { Pie, PieChart, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts'

export default function PiechartComponent(): JSX.Element {
  const [rawLinechartData, setRawLinechartData] = useState<LinechartData[]>([])
  const [calendars, setCalendars] = useState<{ calendarName: string; calendarColor: string }[]>([])
  const [hoveredCalendar, setHoveredCalendar] = useState<string | null>(null)
  const [selectedCalendars, setSelectedCalendars] = useState<Map<string, string[]>>(new Map())
  const [dateString, setDateString] = useState<string>('Months')
  const [dateNumber, setDateNumber] = useState<number>(1)
  const presentedDate = useRef<string>('Months')

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

  useEffect(() => {
    const calendarsArr: { calendarName: string; calendarColor: string }[] = []
    const calendarsSet = new Set<string>()
    for (const ele of rawLinechartData) {
      if (!calendarsSet.has(ele.calendarName)) {
        calendarsSet.add(ele.calendarName)
        calendarsArr.push({ calendarName: ele.calendarName, calendarColor: ele.calendarColor })
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

  const tasksByCalendar = useMemo(() => {
    const map = new Map<string, string[]>()
    rawLinechartData.forEach((row) => {
      if (!map.has(row.calendarName)) map.set(row.calendarName, [])
      const tasks = map.get(row.calendarName)!
      if (!tasks.includes(row.note)) tasks.push(row.note)
    })
    return map
  }, [rawLinechartData])

  // which calendars are in play, and which notes within each
  const visibleSelection = useMemo(() => {
    if (selectedCalendars.size === 0) {
      // nothing selected -> everything
      return new Map(Array.from(tasksByCalendar, ([cal, notes]) => [cal, [...notes]]))
    }
    const map = new Map<string, string[]>()
    selectedCalendars.forEach((tasks, calendarName) => {
      const all = tasksByCalendar.get(calendarName) ?? []
      map.set(calendarName, tasks.length === 0 ? [...all] : tasks)
    })
    return map
  }, [selectedCalendars, tasksByCalendar])

  // inner ring: one slice per calendar. outer ring: one slice per note.
  const { innerData, outerData } = useMemo(() => {
    const calTotals = new Map<string, number>()
    // keyed by calendar::note so identical note text in different calendars stays separate
    const noteTotals = new Map<string, { calendar: string; note: string; value: number }>()

    rawLinechartData.forEach((row) => {
      const allowedNotes = visibleSelection.get(row.calendarName)
      if (!allowedNotes || !allowedNotes.includes(row.note)) return

      const mins = Math.round(row.lap_time / 60000)
      calTotals.set(row.calendarName, (calTotals.get(row.calendarName) ?? 0) + mins)

      const key = `${row.calendarName}::${row.note}`
      const existing = noteTotals.get(key)
      if (existing) {
        existing.value += mins
      } else {
        noteTotals.set(key, { calendar: row.calendarName, note: row.note, value: mins })
      }
    })

    const inner = Array.from(calTotals.entries())
      .filter(([, value]) => value > 0)
      .map(([name, value]) => ({ name, value }))

    // sort notes by parent calendar so outer slices sit above their inner slice
    const calOrder = new Map(inner.map((d, i) => [d.name, i]))
    const outer = Array.from(noteTotals.values())
      .filter((d) => d.value > 0)
      .sort((a, b) => {
        const byCal = (calOrder.get(a.calendar) ?? 0) - (calOrder.get(b.calendar) ?? 0)
        return byCal !== 0 ? byCal : b.value - a.value
      })
      .map((d) => ({ name: d.note, calendar: d.calendar, value: d.value }))

    return { innerData: inner, outerData: outer }
  }, [rawLinechartData, visibleSelection])

  const withAlpha = (color: string | undefined, alpha: number): string => {
    if (!color) return '#c4c4c4'
    const hex = Math.round(alpha * 255)
      .toString(16)
      .padStart(2, '0')
    return `${color}${hex}`
  }

  const calendarColorOf = (name: string): string =>
    calendars.find((c) => c.calendarName === name)?.calendarColor ?? '#c4c4c4'

  // notes fade progressively within their calendar group so siblings stay distinguishable
  const noteShades = useMemo(() => {
    const counters = new Map<string, number>()
    return outerData.map((d) => {
      const idx = counters.get(d.calendar) ?? 0
      counters.set(d.calendar, idx + 1)
      const total = outerData.filter((o) => o.calendar === d.calendar).length
      const alpha = total <= 1 ? 0.75 : 0.9 - (idx / (total - 1)) * 0.5
      return withAlpha(calendarColorOf(d.calendar), alpha)
    })
  }, [outerData, calendars])

  const grandTotal = useMemo(() => innerData.reduce((sum, d) => sum + d.value, 0), [innerData])

  const fmt = (mins: number): string => `${Math.floor(mins / 60)}h ${mins % 60}m`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      {/* chips */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <div
            style={{
              ...styles.chip,
              backgroundColor:
                selectedCalendars.size === 0
                  ? '#a3a3a3'
                  : hoveredCalendar === '__all__'
                    ? '#2e2e2e'
                    : 'unset'
            }}
            onClick={() => setSelectedCalendars(new Map())}
            onMouseEnter={() => setHoveredCalendar('__all__')}
            onMouseLeave={() => setHoveredCalendar(null)}
          >
            <div style={{ height: 15, width: 15, backgroundColor: '#c4c4c4', borderRadius: 10 }} />
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

        {Array.from(selectedCalendars.entries()).map(([calendarName, selectedTasks]) => {
          const calendarColor = calendarColorOf(calendarName)
          const tasks = tasksByCalendar.get(calendarName) ?? []
          return (
            <div
              key={calendarName}
              style={{ display: 'flex', gap: 6, flexWrap: 'wrap', paddingLeft: 16 }}
            >
              <span style={{ color: '#888', fontSize: 12, alignSelf: 'center' }}>
                {calendarName}:
              </span>
              {tasks.map((task) => (
                <div
                  key={task}
                  style={{
                    ...styles.chip,
                    fontSize: 12,
                    backgroundColor: selectedTasks.includes(task) ? calendarColor : 'unset',
                    borderColor: calendarColor
                  }}
                  onClick={() => toggleTask(calendarName, task)}
                >
                  <p>{task}</p>
                </div>
              ))}
            </div>
          )
        })}
      </div>

      {/* date range */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <p style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>DATE RANGE</p>
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          <p style={{ marginRight: 20, fontSize: 12, color: 'var(--color-text-tertiary)' }}>Last</p>
          <select
            onChange={(e) => setDateNumber(Number(e.target.value))}
            value={dateNumber}
            style={{ marginRight: 10 }}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((ele) => (
              <option key={ele} value={ele}>
                {ele}
              </option>
            ))}
          </select>
          <select onChange={(e) => setDateString(e.target.value)} value={dateString}>
            {['Weeks', 'Months', 'Years', 'All Time'].map((ele) => (
              <option key={ele} value={ele}>
                {ele}
              </option>
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
      <ResponsiveContainer width="90%" aspect={1}>
        <PieChart>
          {/* inner ring - calendars */}
          <Pie
            data={innerData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius="45%"
            isAnimationActive={true}
          >
            {innerData.map((entry) => (
              <Cell
                key={entry.name}
                fill={withAlpha(calendarColorOf(entry.name), 0.9)}
                stroke="#1a1a1a"
                strokeWidth={1}
              />
            ))}
          </Pie>

          {/* outer ring - notes */}
          <Pie
            data={outerData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius="52%"
            outerRadius="72%"
            isAnimationActive={true}
            label={({ name, percent }) =>
              `${name} ${(((percent as number) ?? 0) * 100).toFixed(1)}%`
            }
          >
            {outerData.map((entry, i) => (
              <Cell
                key={`${entry.calendar}::${entry.name}`}
                fill={noteShades[i]}
                stroke="#1a1a1a"
                strokeWidth={1}
              />
            ))}
          </Pie>

          <Tooltip
            contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
            itemStyle={{ color: '#ccc' }}
            formatter={(value, name, entry) => {
              const mins = Number(value)
              const pct = grandTotal > 0 ? ((mins / grandTotal) * 100).toFixed(1) : '0.0'
              const parent = (entry?.payload as { calendar?: string })?.calendar
              const label = parent ? `${parent} › ${name}` : String(name)
              return [`${fmt(mins)} (${mins} mins, ${pct}%)`, label]
            }}
          />
          <Legend
            payload={innerData.map((d) => ({
              value: d.name,
              type: 'square',
              color: calendarColorOf(d.name)
            }))}
          />
        </PieChart>
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
