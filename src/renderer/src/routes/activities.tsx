import { DebugStyles } from '@renderer/styles.ts/debugStyle'
import React, { useEffect, useState } from 'react'

interface ActivitesRow {
  id: number
  name: string
}

export default function Activities() {
  const [activities, setActivities] = useState<ActivitesRow[]>()

  useEffect(() => {
    const getActivities = async () => {
      const temp = await window.api.getActivities()
      setActivities(temp)
    }
    getActivities()
  }, [])

  return (
    <div>
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
                <input defaultValue={activity.name} />
              </td>
              <td style={styles.cellStyle}>
                <input type="checkbox" />
              </td>
              <td style={styles.cellStyle}>
                <input defaultValue={activity.name} />
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
