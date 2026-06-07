import React, { useEffect, useState } from 'react'
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
  // fetch linechart data
  useEffect(() => {
    const getData = async () => {
      const result: LinechartData[] = await window.api.getLineChartData()
      setRawLinechartData(result)

      const allGroupedByDate = new Map<string, number>()
      result.forEach((row) => {
        const current = allGroupedByDate.get(row.date) ?? 0
        allGroupedByDate.set(row.date, current + Math.round(row.lap_time / 60000))
      })

      const entries: LinechartEntry[] = Array.from(allGroupedByDate, ([date, total_time]) => ({
        date,
        total_time
      }))

      console.log(entries)
      setCurrLinechartData(entries)
    }
    getData()
  }, [])

  useEffect(() => {
    console.log(rawLinechartData)
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

      <LineChart
        style={{ width: '100%', aspectRatio: 1.618, maxWidth: 600 }}
        responsive
        data={currLinechartData}
      >
        <CartesianGrid />
        <Line dataKey="total_time" />
        <XAxis dataKey="date" />
        <YAxis label={{ value: 'Time (m)', angle: -90, position: 'insideLeft' }} />
        <Tooltip
          contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
          labelStyle={{ color: '#fff' }}
          itemStyle={{ color: '#ccc' }}
          labelFormatter={(label) => `Date: ${new Date(label).toDateString()}`}
          formatter={(value) => [`${value} mins`, 'Total Time']}
        />
        <Legend />
      </LineChart>
    </div>
  )
}
