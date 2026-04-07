import React, { Activity, useEffect, useState } from 'react'

export default function CheckinCheckBoxes() {
  const [activities, setActivities] = useState<{ id: number; name: string }[]>([])
  const [checkedActivities, setCheckedActivities] = useState<Set<number>>(new Set())
  useEffect(() => {
    window.api.getActivities().then(setActivities)
  }, [])

  const handleToggle = (id: number) => {
    console.log(id)
    setCheckedActivities((prev) => {
      const tempSet = new Set(prev)
      tempSet.has(id) ? tempSet.delete(id) : tempSet.add(id)

      return tempSet
    })
  }

  const saveCheckinCheckBoxes = async () => {
    const today = new Date().toISOString().split('T')[0]
    await window.api.insertDailyCheckin(today, Array.from(checkedActivities))
  }

  return (
    <div>
      {activities &&
        activities.map((activity) => (
          <label
            key={activity.id}
            style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}
          >
            <input
              checked={checkedActivities.has(activity.id)}
              type="checkbox"
              onChange={() => handleToggle(activity.id)}
            />
            {activity.name}
          </label>
        ))}
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
        <input type="checkbox" />
        Some option
      </label>
      <button onClick={saveCheckinCheckBoxes}>Save</button>
    </div>
  )
}
