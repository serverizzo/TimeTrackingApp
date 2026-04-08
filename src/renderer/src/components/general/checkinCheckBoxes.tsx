import React, { Activity, useEffect, useState } from 'react'

export default function CheckinCheckBoxes({ date }: { date: string }) {
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
    console.log('todays date', date)
    await window.api.updateCheckin(date, Array.from(checkedActivities))
  }

  return (
    <div>
      <p>Activities for {date}</p>
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
