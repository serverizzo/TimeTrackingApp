import InfoIcon from '@renderer/assets/icons/infoIcon'
import Tooltips from '@renderer/components/activities/Tooltips'
import { DebugStyles } from '@renderer/styles.ts/debugStyle'
import { InputStyle } from '@renderer/styles.ts/inputStyle'
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { ActivitiesRow } from 'src/shared/databasetypes/ActivitiesRow'
import { CalendarRows } from 'src/shared/databasetypes/calendarRows'
import { HexColorPicker } from 'react-colorful'

export default function Activities() {
  const [activities, setActivities] = useState<ActivitiesRow[]>([])
  const [tooltipCalendar, setTooltipsCalendar] = useState<{ xPos: number; yPos: number } | null>(
    null
  )
  const [tooltipLaps, setTooltipsLaps] = useState<{ xPos: number; yPos: number } | null>(null)
  const [tooltipCheckin, setTooltipCheckin] = useState<{ xPos: number; yPos: number } | null>(null)

  const [calendars, setCalendars] = useState<CalendarRows[]>([])
  const [dirty, setDirty] = useState<Set<string>>(new Set())

  const [showColorPicker, setShowColorPicker] = useState<number | null>()

  const [userDataPath, setUserDataPath] = useState<string>('')

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

  // set datapath to get icons
  useEffect(() => {
    const getPath = async () => {
      await window.api.getUserDataPath().then(setUserDataPath)
    }
    getPath()
  }, [])

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
    try {
      await toast.promise(
        async () => {
          await window.api.updateActivity(activities) // old calendar names still exist in DB ✓
          await window.api.updateCalendar(calendars) // now rename calendars
        },
        {
          loading: 'Saving...',
          success: 'Saved!',
          error: 'Error saving, try again'
        }
      )

      const updatedCalendars = await window.api.getCalendars()
      setCalendars(updatedCalendars)

      const updatedActivities = await window.api.getActivities()
      setActivities(updatedActivities)
      setDirty(new Set())
    } catch (e) {
      // do nothing
    }
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

  const updateColor = (calendarId, inputColor) => {
    setDirty((prev) => new Set(prev).add(`calendar:${calendarId}:color`))
    setCalendars((prev) =>
      prev.map((ele) => (ele.id === calendarId ? { ...ele, color: inputColor } : ele))
    )
  }

  const openDialog = (id: number) => {
    window.api.openDialog(id)
  }

  return (
    <div style={{ display: 'flex', height: '100vh', flexDirection: 'column' }}>
      <div style={{ alignSelf: 'flex-start' }}>
        <button onClick={saveToDatabase}>Save</button>
      </div>

      <div className="scroll_enabled">
        <div style={{ paddingBottom: '20px' }}>
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
                    <td
                      style={
                        isCellDirty(`calendar:${calendar.id}:color`)
                          ? styles.dirtyCell
                          : styles.cellStyle
                      }
                    >
                      {/* Color preview */}
                      <div
                        onClick={() => setShowColorPicker(calendar.id)}
                        style={{
                          backgroundColor: calendar.color,
                          height: '20px',
                          width: '50px',
                          borderRadius: 5
                        }}
                      />
                      <div style={{ position: 'relative' }}>
                        {showColorPicker === calendar.id && (
                          // transparent overlay to hide picker on click
                          <>
                            <div
                              onClick={() => {
                                setShowColorPicker(null)
                              }}
                              style={{
                                position: 'fixed',
                                top: 0,
                                left: 0,
                                height: '100vh',
                                width: '100vw',
                                zIndex: 1
                              }}
                            />
                            <div
                              style={{
                                position: 'absolute',
                                left: 55 // the width of the swatch + 5 px
                              }}
                            >
                              <HexColorPicker
                                style={{ zIndex: 2 }}
                                color={calendar.color}
                                onChangeEnd={(color) => updateColor(calendar.id, color)}
                              />
                            </div>
                          </>
                        )}
                      </div>
                    </td>
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
                      onMouseEnter={(e) =>
                        setTooltipsCalendar({ xPos: e.clientX, yPos: e.clientY })
                      }
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
                <th style={styles.cellStyle}>
                  <div style={{ display: 'flex' }}>
                    <p>Change Icon</p>
                    <div
                      onMouseEnter={(e) => setTooltipCheckin({ xPos: e.clientX, yPos: e.clientY })}
                      onMouseLeave={() => setTooltipCheckin(null)}
                    >
                      <InfoIcon size={20} />
                    </div>
                  </div>
                </th>
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
                  <td style={{ ...styles.cellStyle, display: 'flex', justifyContent: 'center' }}>
                    <div
                      style={{
                        background: '#383838',
                        borderRadius: 3,
                        height: 40,
                        width: 40,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#4a4a4a')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = '#383838')}
                      onMouseDown={(e) => (e.currentTarget.style.background = '#2a2a2a')}
                      onMouseUp={(e) => (e.currentTarget.style.background = '#4a4a4a')}
                      onClick={() => openDialog(activity.id)}
                    >
                      {activity.iconLocation && (
                        <img
                          style={{ padding: 5 }}
                          src={
                            activity.iconLocation
                              ? `appicon://${userDataPath}/icons/${activity.iconLocation}`
                              : ''
                          }
                        />
                      )}
                    </div>
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
      </div>

      {tooltipCalendar && (
        <Tooltips
          xPos={tooltipCalendar.xPos}
          yPos={tooltipCalendar.yPos}
          offset={12}
          message={`
            Different calendars will contatin differnt colors that will be displayed on the heat map. 
            Different calendars will also be different filters on the line map`}
        />
      )}

      {tooltipLaps && (
        <Tooltips
          xPos={tooltipLaps.xPos}
          yPos={tooltipLaps.yPos}
          offset={12}
          message={`
            If checked, will show up in the autocomplete in the lap display. 
            `}
        />
      )}

      {tooltipCheckin && (
        <Tooltips
          xPos={tooltipCheckin.xPos}
          yPos={tooltipCheckin.yPos}
          offset={12}
          message={`Right clicking on the calendar will show a menu that says, 'update checkins', 
            checking this box and having an icon will display that icon on the calendar`}
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
