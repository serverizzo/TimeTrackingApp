import React, { useEffect, useMemo, useState } from 'react'
import { LapEntry } from './types'
import { LinechartData } from 'src/shared/queryTypes/linechartData'
// import { RechartsDevtools } from '@recharts/devtools'
import { CartesianGrid, Legend, Line, LineChart, XAxis, YAxis, Tooltip } from 'recharts'
import { msToMins } from '@renderer/helperFunctions/date/date'

interface LinechartEntry {
  date: string
  total_time: number
}

export default function Linechart() {
  const [currLinechartData, setCurrLinechartData] = useState<LinechartEntry[]>([])
  const [rawLinechartData, setRawLinechartData] = useState<LinechartData[]>([])
  const [calendars, setCalendars] = useState<{ calendarName: string; calendarColor: string }[]>([])
  const [allButton, setAllButton] = useState<boolean>(false)
  const [activeLines, setActiveLines] = useState<string[]>([])

  // fetch linechart data
  useEffect(() => {
    const getData = async () => {
      const result: LinechartData[] = await window.api.getLineChartData()
      setRawLinechartData(result)
    }
    getData()
  }, [])

  // setLinechartData
  const chartData = useMemo(() => {
    const grouped = new Map<string, Record<string, number>>()

    rawLinechartData.forEach((row) => {
      if (!grouped.has(row.date)) grouped.set(row.date, {})
      const day = grouped.get(row.date)!

      //total_time
      day['total_time'] = (day['total_time'] ?? 0) + Math.round(row.lap_time / 60000)

      // calendar level sum
      day[row.calendarName] = (day[row.calendarName] ?? 0) + Math.round(row.lap_time / 60000)

      // lap level sum
      day[row.note] = (day[row.note] ?? 0) + Math.round(row.lap_time / 60000)
    })
    console.log(grouped)
    return Array.from(grouped, ([date, values]) => ({ date, ...values }))
  }, [rawLinechartData])

  // createListOfCalendars
  useEffect(() => {
    const calendarsArr: { calendarName: string; calendarColor: string }[] = []
    const calendarsSet = new Set()
    for (const ele of rawLinechartData) {
      if (!calendarsSet.has(ele.calendarName)) {
        calendarsSet.add(ele.calendarName)
        calendarsArr.push({ calendarName: ele.calendarName, calendarColor: ele.calendarColor })
      }
    }
    setCalendars(calendarsArr)
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

  useEffect(() => {
    console.log(activeLines)
  }, [activeLines])

  return (
    <div>
      <LineChart
        style={{ width: '100%', aspectRatio: 1.618, maxWidth: 600 }}
        responsive
        data={data}
      >
        <CartesianGrid />
        <Line dataKey="uv" />
        <XAxis dataKey="name" />
        <YAxis />
        <Legend />
      </LineChart>

      {/* all chip */}
      <div onClick={() => setActiveLines([])} style={{ display: 'flex' }}>
        <div style={styles.chip}>
          <div
            style={{
              height: 15,
              width: 15,
              backgroundColor: '#c4c4c4',
              borderRadius: 10
            }}
          />
          <p>All</p>
        </div>
      </div>
      {/* calendar chips */}
      <div style={{ display: 'flex' }}>
        {calendars &&
          calendars.map((calendar) => (
            <div
              key={calendar.calendarName}
              style={styles.chip}
              onClick={() => toggleLine(calendar.calendarName)}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#2e2e2e')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'unset')}
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
          ))}
      </div>

      <LineChart
        style={{ width: '100%', aspectRatio: 1.618, maxWidth: 600 }}
        responsive
        data={chartData}
      >
        <CartesianGrid />
        {activeLines.length === 0 ? (
          <Line dataKey="total_time" />
        ) : (
          activeLines.map((lineName) => <Line key={lineName} dataKey={lineName} />)
        )}
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
          formatter={(value) => [`${value} mins`, 'Total Time']}
        />
        <Legend />
      </LineChart>
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
