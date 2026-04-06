import React, { Activity, useEffect, useState } from 'react'

export default function CheckinCheckBoxes() {
  const [activities, setActivities] = useState<{ id: number; name: string }[]>([])
  useEffect(() => {
    window.api.getActivities().then(setActivities)
  }, [])

  return (
    <div>
      {activities &&
        activities.map((activity) => (
          <label
            key={activity.id}
            style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}
          >
            <input type="checkbox" />
            {activity.name}
          </label>
        ))}
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
        <input type="checkbox" />
        Some option
      </label>
    </div>
  )
}
