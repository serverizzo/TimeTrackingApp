import { image } from 'd3'
import React, { useEffect, useRef, useState } from 'react'
import { TimelineData } from 'src/shared/queryTypes/timelineData'
import {
  msToMins,
  formatDateWithDay,
  removeSeconds,
  getEndTime
} from '@renderer/helperFunctions/date/date'

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
              backgroundColor: '#313131',
              marginBottom: 10,
              paddingLeft: 10,
              borderRadius: 6,
              paddingTop: 10
            }}
          >
            <h2>
              {formatDateWithDay(entry.date)}{' '}
              {msToMins(
                entry.laparray.reduce((cummulative, curr) => cummulative + curr.lap_time, 0)
              )}
            </h2>

            {/* daily checkins */}
            <div
              style={{
                backgroundColor: '#535353',
                display: 'flex',
                padding: 8,
                marginTop: 5,
                marginBottom: 15,
                // marginTop: 5,
                borderRadius: 6
              }}
            >
              {entry.activities?.map((activity) => (
                <img
                  style={{ height: 30 }}
                  title={activity.icon_name}
                  src={
                    activity.location ? `appicon://${userDataPath}/icons/${activity.location}` : ''
                  }
                ></img>
              ))}
            </div>

            {/* Laps */}
            {entry.laparray.map((lap) => {
              return (
                <div
                  style={{
                    display: 'flex',
                    marginBottom: 20,
                    paddingBottom: 20,
                    width: '100%',
                    borderBottom: '1px solid #1f1f1fea'
                  }}
                >
                  {/* side color */}
                  <div
                    title={lap.calendarname}
                    style={{
                      height: '70px',
                      width: '10px',
                      backgroundColor: lap.calendarcolor,
                      marginRight: 10,
                      borderRadius: 4
                    }}
                  />
                  <div style={{ width: '100%' }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        flexDirection: 'row',
                        paddingRight: '10px'
                      }}
                    >
                      <h3>{lap.note}</h3>
                      <p style={{ fontStyle: 'italic', color: '#7e7e7e' }}>
                        {removeSeconds(lap.timestarted)} -{' '}
                        {getEndTime(lap.timestarted, lap.lap_time)} ({msToMins(lap.lap_time)})
                      </p>
                    </div>

                    <div style={{ marginLeft: 7, marginRight: 20 }}>
                      <p>{lap.comments}</p>
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
