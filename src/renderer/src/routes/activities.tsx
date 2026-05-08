import Tooltips from '@renderer/components/activities/Tooltips'
import { DebugStyles } from '@renderer/styles.ts/debugStyle'
import React, { useEffect, useState } from 'react'
import { ActivitiesRow } from 'src/shared/databasetypes/ActivitiesRow'

export default function Activities() {
  const [activities, setActivities] = useState<ActivitiesRow[]>([])
  const [tooltipCalendar, setTooltipsCalendar] = useState<{ xPos: number; yPos: number } | null>(
    null
  )

  useEffect(() => {
    const getActivities = async () => {
      const temp = await window.api.getActivities()
      setActivities(temp)
    }
    getActivities()
  }, [])

  const handleChange = (
    id: number,
    field: keyof ActivitiesRow,
    value: string | number | boolean
  ) => {
    if (field === 'isTrackedInLaps' || field === 'isTrackedInCheckin') {
      value = value ? 1 : 0
    }
    setActivities((prev) =>
      prev?.map((activity) => (activity.id === id ? { ...activity, [field]: value } : activity))
    )
  }

  const saveToDatabase = async () => {
    // window.api.saveToDatabase()
    window.api.updateOrInsertActivity(activities)
  }

  return (
    <div>
      <button onClick={saveToDatabase}>Save</button>
      <table>
        <thead>
          <tr>
            <th style={styles.cellStyle}>Activity Name</th>
            <th style={styles.cellStyle}>Tracked in Laps</th>
            <th style={{ ...styles.cellStyle, display: 'flex', justifyContent: 'center' }}>
              <div style={{ display: 'flex' }}>
                <p>Name of Calandar/Heatmap</p>
                <div
                  onMouseEnter={(e) => setTooltipsCalendar({ xPos: e.clientX, yPos: e.clientY })}
                  onMouseLeave={() => setTooltipsCalendar(null)}
                  style={{ background: 'red', height: '10px', width: '10px', borderRadius: 10 }}
                />
              </div>
            </th>
            <th style={styles.cellStyle}>Tracked in check-in</th>
            <th style={styles.cellStyle}>Icon</th>
            <th style={styles.cellStyle}></th> {/* purposefully empty, left for trash icon */}
          </tr>
        </thead>
        <tbody>
          {activities?.sort().map((activity) => (
            <tr>
              <td style={styles.cellStyle}>
                <input
                  value={activity.name}
                  onChange={(e) => handleChange(activity.id, 'name', e.target.value)}
                />
              </td>
              <td style={styles.cellStyle}>
                <input
                  onChange={(e) => {
                    handleChange(activity.id, 'isTrackedInLaps', e.target.checked)
                  }}
                  type="checkbox"
                />
              </td>
              <td style={styles.cellStyle}>
                <input
                  onChange={(e) => {
                    handleChange(activity.id, 'calendar', e.target.value)
                  }}
                />
              </td>
              <td style={styles.cellStyle}>
                <input
                  onChange={(e) =>
                    handleChange(activity.id, 'isTrackedInCheckin', e.target.checked)
                  }
                  type="checkbox"
                />
              </td>
              <td style={styles.cellStyle}>
                <input type="checkbox" />
              </td>
              <td style={styles.cellStyle}>
                <input type="checkbox" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {tooltipCalendar && (
        <Tooltips
          xPos={tooltipCalendar.xPos}
          yPos={tooltipCalendar.yPos}
          offset={12}
          message={'new message'}
        />
      )}
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  cellStyle: {
    borderColor: 'green',
    borderStyle: 'solid',
    borderWidth: '1px',
    textAlign: 'center',
    padding: 10
  }
}
