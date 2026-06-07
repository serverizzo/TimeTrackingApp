import React, { useEffect, useState } from 'react'
import { LapEntry } from './types'
import { LinechartData } from 'src/shared/queryTypes/linechartData'
import { RechartsDevtools } from '@recharts/devtools'
import { Line, LineChart } from 'recharts'

export default function Linechart() {
  const [linechartData, setLinechartData] = useState<LinechartData[]>([])
  // fetch linechart data
  //
  useEffect(() => {
    window.api.getLineChartData().then(setLinechartData)
  }, [])

  useEffect(() => {
    console.log(linechartData)
  }, [linechartData])

  return <div></div>
}
