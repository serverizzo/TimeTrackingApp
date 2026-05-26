import { useStopwatch } from '@renderer/context/stopwatchcontext'
import { Trie } from '@renderer/helperFunctions/trie/trie'
import React, { Activity, useEffect, useRef, useState } from 'react'
import { ActivitiesRow } from 'src/shared/databasetypes/ActivitiesRow'
import { CalendarRows } from 'src/shared/databasetypes/calendarRows'

export default function LapDisplay() {
  const { laps, convertToTime, millisecondsToTime, updateNote, updateCalendar } = useStopwatch()

  const [activities, setActivities] = useState<ActivitiesRow[]>()
  const activityTrie = useRef<Trie>(new Trie())
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [activiveNoteSuggestion, setActiveNoteSuggestion] = useState<number>()
  const [highlightedElementIndex, setHighlightedElementIndex] = useState<number>()
  const [calendars, setCalendars] = useState<CalendarRows[]>([])

  useEffect(() => {
    const getActivities = async () => {
      const activities = await window.api.getActivities()
      setActivities(activities)
    }
    getActivities()
  }, [])

  useEffect(() => {
    const getCalendars = async () => {
      const res = await window.api.getCalendars()
      setCalendars(res)
    }
    getCalendars()
  }, [])

  useEffect(() => {
    const activitiesArray = activities
      ?.filter((activity) => activity.isTrackedInLaps)
      .map((activity) => activity.name)
    console.log(activitiesArray)
    if (activitiesArray) {
      for (let activity of activitiesArray) {
        activityTrie.current.insert(activity)
      }
    }
  }, [activities])

  const handleNoteChange = (index, activityOrNote) => {
    updateNote(index, activityOrNote)
    updateCalendar(index, activityOrNote)

    setSuggestions(activityTrie.current.suggestion(activityOrNote))
    setActiveNoteSuggestion(index)
  }

  const highlightHovered = (index) => {
    setHighlightedElementIndex(index)
  }

  const handleDropdownSelection = (calendarId) => {
    const calendar = calendars.find((c) => c.id === calendarId)
    console.log(calendar)
  }

  return (
    <table>
      <thead>
        <tr>
          <th style={styles.cellStyle}>Time Started</th>
          <th style={styles.cellStyle}>Lap Time</th>
          <th style={styles.cellStyle}>Cumulative Total</th>
          <th style={styles.cellStyle}>Notes</th>
          <th style={styles.cellStyle}>Calendar</th>
        </tr>
      </thead>
      <tbody>
        {laps.map((ele, index) => (
          <tr key={ele.id}>
            <td style={styles.cellStyle}>{ele.timestarted}</td>
            <td style={styles.cellStyle}>{convertToTime(millisecondsToTime(ele.lapTime))}</td>
            <td style={styles.cellStyle}>
              {convertToTime(millisecondsToTime(ele.cumulativeTotal))}
            </td>
            <td style={{ ...styles.cellStyle, position: 'relative' }}>
              <input
                value={ele.note}
                onClick={() => {
                  handleNoteChange(index, ele.note)
                }}
                onBlur={() => setActiveNoteSuggestion(undefined)}
                onChange={(e) => handleNoteChange(index, e.target.value)}
              />

              {/* Autocomplete */}
              {suggestions.length > 0 && activiveNoteSuggestion == index && (
                <div
                  style={{
                    padding: '6px 12px',
                    cursor: 'pointer',
                    backgroundColor: '#1a1a1a',
                    color: '#ffffff',
                    fontSize: '13px',
                    borderBottom: '1px solid #333'
                  }}
                >
                  {suggestions.map((s, suggestionIndex) => (
                    <div
                      onMouseEnter={() => setHighlightedElementIndex(suggestionIndex)}
                      onMouseLeave={() => setHighlightedElementIndex(undefined)}
                      style={{
                        backgroundColor:
                          highlightedElementIndex === suggestionIndex ? '#2a2a2a' : '#1a1a1a'
                      }}
                      key={suggestionIndex}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        handleNoteChange(index, s)
                        setActiveNoteSuggestion(undefined)
                      }}
                    >
                      {s}
                    </div>
                  ))}
                </div>
              )}
            </td>
            {/* TODO -- Calendar */}
            <td style={styles.cellStyle}>
              <input value={ele.calendar}></input>
              <select
                onChange={(e) => handleDropdownSelection(Number(e.target.value))}
                disabled={ele.calendarId > -1}
              >
                {calendars.map((c) => (
                  <option value={c.id}>{c.name}</option>
                ))}
                <option value={-1}>Uncategorized </option>
              </select>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  cellStyle: {
    borderColor: 'green',
    borderStyle: 'solid',
    borderWidth: '1px',
    margin: 5
  }
}
