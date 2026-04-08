import React, { Activity, useEffect, useState } from 'react'

export default function CheckinCheckBoxes() {
  const [activities, setActivities] = useState<{ id: number; name: string }[]>([])
  const [checkedActivities, setCheckedActivities] = useState<{ id: number; isChecked: boolean }[]>(
    []
  )
  useEffect(() => {
    window.api.getActivities().then((passedActivities) => {
      setActivities(passedActivities)
      setCheckedActivities(passedActivities.map((ele) => ({ id: ele.id, isChecked: false })))
    })
  }, [])

  const handleToggle = (id: number) => {
    setCheckedActivities((prev) =>
      prev.map((ele: { id: number; isChecked: boolean }) =>
        ele.id == id ? { ...ele, isChecked: !ele.isChecked } : ele
      )
    )
  }

  const saveCheckinCheckBoxes = async () => {
    const today = new Date().toISOString().split('T')[0]
    await window.api.updateCheckin(today, Array.from(checkedActivities))
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
              checked={checkedActivities.find((a) => a.id === activity.id)?.isChecked ?? false}
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
