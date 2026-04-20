import React, { useEffect, useState } from 'react'

interface Props {
  date: string
  setOpen: (value: boolean) => void
  setRerender: (value: (prev: boolean) => boolean) => void
}

export default function CheckinCheckBoxes({ date, setOpen, setRerender }: Props) {
  const [activities, setActivities] = useState<{ id: number; name: string }[]>([])
  const [checkedActivities, setCheckedActivities] = useState<
    { id: number; name: string; isChecked: boolean }[]
  >([])
  useEffect(() => {
    // window.api.getActivities().then((passedActivities) => {
    //   setActivities(passedActivities)
    //   setCheckedActivities(passedActivities.map((ele) => ({ id: ele.id, isChecked: false })))
    // })

    window.api.getCheckedActivities(date).then((res) => {
      setCheckedActivities(res)
    })
  }, [])

  const handleToggle = (id: number) => {
    setCheckedActivities((prev) =>
      prev.map((ele: { id: number; isChecked: boolean; name: string }) =>
        ele.id == id ? { ...ele, isChecked: !ele.isChecked } : ele
      )
    )
  }

  const saveCheckinCheckBoxes = async () => {
    console.log('todays date', date)
    await window.api.updateCheckin(date, Array.from(checkedActivities))
    setOpen(false)
    setRerender((prev) => !prev)
  }

  return (
    <div>
      <p>Activities for {date}</p>
      {checkedActivities &&
        checkedActivities.map((activity) => (
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
