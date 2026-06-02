import { image } from 'd3'
import React, { useEffect, useState } from 'react'
import { TimelineData } from 'src/shared/queryTypes/timelineData'
import { msToMins } from '@renderer/helperFunctions/date/date'

export default function Timeline() {
  const [timelineData, setTimelineData] = useState<TimelineData[]>([])
  const [userDataPath, setUserDataPath] = useState<string>('')

  useEffect(() => {
    const fetch = async () => {
      const data = await window.api.getTimeLineData()
      setTimelineData(data)
    }
    fetch()
  }, [])

  useEffect(() => {
    window.api.getUserDataPath().then(setUserDataPath)
  })

  useEffect(() => {
    console.log(timelineData)
  }, [timelineData])

  return (
    <div>
      {timelineData &&
        timelineData.map((entry) => (
          <div
            style={{
              backgroundColor: '#888888',
              marginBottom: 10,
              paddingLeft: 10,
              borderRadius: 6
            }}
          >
            <h2>{entry.date}</h2>
            {/* daily checkins */}
            {entry.activities?.map((activity) => (
              <img
                style={{ height: 30 }}
                title={activity.icon_name}
                src={
                  activity.location ? `appicon://${userDataPath}/icons/${activity.location}` : ''
                }
              ></img>
            ))}

            {/* Laps */}
            {entry.laparray.map((lap) => {
              const x = 0
              return (
                <div>
                  <p>{lap.note}</p>
                  <p>
                    {lap.timestarted} - {lap.timestarted} ({msToMins(lap.lap_time)})
                  </p>
                </div>
              )
            })}
          </div>
        ))}
    </div>
  )
}
