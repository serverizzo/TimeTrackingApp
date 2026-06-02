import { image } from 'd3'
import React, { useEffect, useRef, useState } from 'react'
import { TimelineData } from 'src/shared/queryTypes/timelineData'
import { msToMins, formatDateWithDay } from '@renderer/helperFunctions/date/date'

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
              // padding: 10
            }}
          >
            <h2>{formatDateWithDay(entry.date)}</h2>
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
              return (
                <div style={{ display: 'flex', marginBottom: 5 }}>
                  <div
                    style={{
                      height: '50px',
                      width: '10px',
                      backgroundColor: lap.calendarcolor,
                      marginRight: 10
                    }}
                  />
                  <div>
                    <p>{lap.note}</p>
                    <div style={{ marginLeft: 5 }}>
                      <p>
                        {lap.timestarted} - {lap.timestarted} ({msToMins(lap.lap_time)})
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ))}
    </div>
  )
}
