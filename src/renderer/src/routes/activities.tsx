import { DebugStyles } from '@renderer/styles.ts/debugStyle'
import React, { useEffect, useState } from 'react'
import { ActivitiesRow } from 'src/shared/databasetypes/ActivitiesRow'

export default function Activities() {
  const [activities, setActivities] = useState<ActivitiesRow[]>([])

  useEffect(() => {
    const getActivities = async () => {
      const temp = await window.api.getActivities()
      setActivities(temp)
    }
    getActivities()
  }, [])

  const handleChange = (id: number, field: keyof ActivitiesRow, value: string | boolean) => {
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
            <th style={styles.cellStyle}>Include in autocomplete</th>
            <th style={styles.cellStyle}>Name of Calandar/Heatmap</th>
            <th style={styles.cellStyle}>Include in check-in</th>
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
                <input type="checkbox" />
              </td>
              <td style={styles.cellStyle}>
                <input />
              </td>
              <td style={styles.cellStyle}>
                <input type="checkbox" />
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
