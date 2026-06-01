import React, { useEffect, useState } from 'react'
import { TimelineData } from 'src/shared/queryTypes/timelineData'

export default function Timeline() {
  const [timelineData, setTimelineData] = useState<TimelineData>()

  useEffect(() => {
    const fetch = async () => {
      const data = await window.api.getTimeLineData()
      setTimelineData(data)
    }
    fetch()
  }, [])

  useEffect(() => {
    console.log(timelineData)
  }, [timelineData])

  return <div>Timeline</div>
}
