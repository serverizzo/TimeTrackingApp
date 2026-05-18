import InfoIcon from '@renderer/assets/icons/infoIcon'
import Tooltips from '@renderer/components/activities/Tooltips'
import { DebugStyles } from '@renderer/styles.ts/debugStyle'
import { InputStyle } from '@renderer/styles.ts/inputStyle'
import { active } from 'd3'
import React, { useEffect, useState } from 'react'
import { ActivitiesRow } from 'src/shared/databasetypes/ActivitiesRow'
import { CalendarRows } from 'src/shared/databasetypes/calendarRows'

export default function Activities() {
  const [activities, setActivities] = useState<ActivitiesRow[]>([])
  const [tooltipCalendar, setTooltipsCalendar] = useState<{ xPos: number; yPos: number } | null>(
    null
  )
  const [tooltipLaps, setTooltipsLaps] = useState<{ xPos: number; yPos: number } | null>(null)
  const [tooltipCheckin, setTooltipCheckin] = useState<{ xPos: number; yPos: number } | null>(null)

  const [calendars, setCalendars] = useState<CalendarRows[]>([])
  const [dirty, setDirty] = useState<Set<string>>(new Set())

  useEffect(() => {
    const getActivities = async () => {
      const temp = await window.api.getActivities()
      setActivities(temp)
    }
    getActivities()

    const getCalendars = async () => {
      const temp = await window.api.getCalendars()
      setCalendars(temp)
    }
    getCalendars()
  }, [])

  useEffect(() => {
    console.log(calendars)
  }, [calendars])

  const handleActivityChange = (
    id: number,
    field: keyof ActivitiesRow,
    value: string | number | boolean
  ) => {
    if (field === 'isTrackedInLaps' || field === 'isTrackedInCheckin') {
      value = value ? 1 : 0
    }
    setDirty((prev) => new Set(prev).add(`activity:${id}:${field}`))
    setActivities((prev) =>
      prev?.map((activity) => (activity.id === id ? { ...activity, [field]: value } : activity))
    )
  }

  const saveToDatabase = async () => {
    await window.api.updateActivity(activities) // old calendar names still exist in DB ✓

    await window.api.updateCalendar(calendars) // now rename calendars
    const updatedCalendars = await window.api.getCalendars()
    setCalendars(updatedCalendars)

    const updatedActivities = await window.api.getActivities()
    setActivities(updatedActivities)
  }

  const addCalendar = async () => {
    await window.api.insertNewCalendar()
    const updated = await window.api.getCalendars()
    setCalendars(updated)
  }

  const setCalendarsNames = (id: number, updatedName: string) => {
    console.log(id, updatedName)
    setDirty((prev) => new Set(prev).add(`calendar:${id}:name`))
    setCalendars((prev) =>
      prev.map((calendar) => (calendar.id === id ? { ...calendar, name: updatedName } : calendar))
    )
  }

  const isCellDirty = (cell: string) => {
    return dirty.has(cell)
  }

  const addActivity = async () => {
    await window.api.insertNewActivity()
    const updated = await window.api.getActivities()
    setActivities(updated)
  }

  const deleteActivity = async (id: number) => {
    await window.api.deleteActivity(id)
    const updated = await window.api.getActivities()
    setActivities(updated)
  }

  return (
    <div style={{ display: 'flex', height: '100vh', flexDirection: 'column' }}>
      <div style={{ alignSelf: 'flex-start' }}>
        <button onClick={saveToDatabase}>Save</button>
      </div>

      <div
        className="scroll_enabled"
        style={{ paddingRight: '2px', overflow: 'auto', marginBottom: 10, alignSelf: 'flex-start' }}
      >
        <table>
          <thead style={{ position: 'sticky', top: 0, zIndex: 1, background: '#1e1e1e' }}>
            <tr>
              <th style={styles.cellStyle}>Calendar Name</th>
              <th style={styles.cellStyle}>Color</th>
            </tr>
          </thead>
          <tbody>
            {calendars &&
              calendars.map((calendar) => (
                <tr key={calendar.id}>
                  <td
                    style={
                      isCellDirty(`calendar:${calendar.id}:name`)
                        ? styles.dirtyCell
                        : styles.cellStyle
                    }
                  >
                    <input
                      style={{ ...InputStyle.darkBackground }}
                      onChange={(e) => setCalendarsNames(calendar.id, e.target.value)}
                      value={calendar.name}
                    />
                  </td>
                  <td style={styles.cellStyle}>{calendar.color}</td>
                </tr>
              ))}
            <tr></tr>
          </tbody>
        </table>
        <button onClick={addCalendar}>Add new calendar</button>
      </div>

      <div
        className="scroll_enabled"
        style={{
          paddingRight: '2px',
          overflow: 'auto',
          position: 'sticky',
          top: 0,
          zIndex: 1,

          paddingBottom: '40px',
          marginBottom: '20px'
        }}
      >
        <table style={{}}>
          <thead
            style={{
              position: 'sticky',
              top: 0,
              zIndex: 1,
              background: '#1e1e1e'
            }}
          >
            <tr>
              <th style={styles.cellStyle}>Activity Name</th>
              <th style={styles.cellStyle}>
                <div style={{ display: 'flex' }}>
                  <p>Tracked in Laps</p>
                  <div
                    onMouseEnter={(e) => setTooltipsLaps({ xPos: e.clientX, yPos: e.clientY })}
                    onMouseLeave={() => setTooltipsLaps(null)}
                  >
                    <InfoIcon size={20} />
                  </div>
                </div>
              </th>
              <th style={{ ...styles.cellStyle, display: 'flex', justifyContent: 'center' }}>
                <div style={{ display: 'flex' }}>
                  <p>Name of Calandar/Heatmap</p>
                  <div
                    onMouseEnter={(e) => setTooltipsCalendar({ xPos: e.clientX, yPos: e.clientY })}
                    onMouseLeave={() => setTooltipsCalendar(null)}
                  >
                    <InfoIcon size={20} />
                  </div>
                </div>
              </th>
              <th style={styles.cellStyle}>
                <div style={{ display: 'flex' }}>
                  <p>Tracked in check-in</p>
                  <div
                    onMouseEnter={(e) => setTooltipCheckin({ xPos: e.clientX, yPos: e.clientY })}
                    onMouseLeave={() => setTooltipCheckin(null)}
                  >
                    <InfoIcon size={20} />
                  </div>
                </div>
              </th>
              <th style={styles.cellStyle}>Icon</th>
              {/* purposefully empty, left for trash icon */}
              <th style={styles.cellStyle}></th>
            </tr>
          </thead>
          <tbody>
            {activities?.sort().map((activity) => (
              <tr key={activity.id}>
                <td
                  style={
                    isCellDirty(`activity:${activity.id}:name`)
                      ? styles.dirtyCell
                      : styles.cellStyle
                  }
                >
                  <input
                    style={{ ...InputStyle.darkBackground }}
                    value={activity.name}
                    onChange={(e) => handleActivityChange(activity.id, 'name', e.target.value)}
                  />
                </td>
                <td
                  style={
                    isCellDirty(`activity:${activity.id}:isTrackedInLaps`)
                      ? styles.dirtyCell
                      : styles.cellStyle
                  }
                >
                  <input
                    style={styles.checkmarkBox}
                    checked={activity.isTrackedInLaps}
                    onChange={(e) => {
                      handleActivityChange(activity.id, 'isTrackedInLaps', e.target.checked)
                    }}
                    type="checkbox"
                  />
                </td>
                <td
                  style={
                    isCellDirty(`activity:${activity.id}:calendar`)
                      ? styles.dirtyCell
                      : styles.cellStyle
                  }
                >
                  <input
                    style={{ ...InputStyle.darkBackground }}
                    value={activity.calendar ?? ''}
                    onChange={(e) => {
                      handleActivityChange(activity.id, 'calendar', e.target.value)
                    }}
                  />
                </td>
                <td
                  style={
                    isCellDirty(`activity:${activity.id}:isTrackedInCheckin`)
                      ? styles.dirtyCell
                      : styles.cellStyle
                  }
                >
                  <input
                    style={styles.checkmarkBox}
                    checked={activity.isTrackedInCheckin}
                    onChange={(e) =>
                      handleActivityChange(activity.id, 'isTrackedInCheckin', e.target.checked)
                    }
                    type="checkbox"
                  />
                </td>
                <td
                  style={
                    isCellDirty(`activity:${activity.id}:icon`)
                      ? styles.dirtyCell
                      : styles.cellStyle
                  }
                >
                  <input type="checkbox" />
                </td>
                {/* delete */}
                <td style={styles.cellStyle}>
                  <button onClick={() => deleteActivity(activity.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
          <button onClick={addActivity}>Add new activity</button>
        </table>
      </div>

      {tooltipCalendar && (
        <Tooltips
          xPos={tooltipCalendar.xPos}
          yPos={tooltipCalendar.yPos}
          offset={12}
          message={'new message'}
        />
      )}

      {tooltipLaps && (
        <Tooltips
          xPos={tooltipLaps.xPos}
          yPos={tooltipLaps.yPos}
          offset={12}
          message={'Laps Message'}
        />
      )}

      {tooltipCheckin && (
        <Tooltips
          xPos={tooltipCheckin.xPos}
          yPos={tooltipCheckin.yPos}
          offset={12}
          message={'checkin Message'}
        />
      )}
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  cellStyle: {
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderStyle: 'solid',
    borderWidth: '1px',
    textAlign: 'center',
    padding: 10
  },
  dirtyCell: {
    borderColor: '#db8514e3',
    borderStyle: 'solid',
    borderWidth: '3px',
    textAlign: 'center',
    padding: 10
  },
  checkmarkBox: {
    width: '20px',
    height: '20px',
    cursor: 'pointer'
  }
}
