import { useEffect, useState } from 'react'
import Modal from '../general/checkinModal'
import CheckinCheckBoxes from '../general/checkinCheckBoxes'
import ToolTipDateSummary from './HeatmapSubComponents/ToolTipDateSummary'
import ContextMenu from './HeatmapSubComponents/contextMenu'
import { CalendarRows } from 'src/shared/databasetypes/calendarRows'
import { CheckinItem } from 'src/shared/queryTypes/CheckinItem'
import { HeatmapDataByDayAndCalendar } from 'src/shared/queryTypes/heatmapByDayAndCalendar'
import { CheckinItemByDay } from 'src/shared/queryTypes/checkinItemByDay'

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function getColor(total: number, max: number): string {
  if (total === 0 || max === 0) return 'rgba(128,128,128,0.1)'
  const intensity = total / max
  if (intensity < 0.25) return '#9FE1CB'
  if (intensity < 0.5) return '#5dcaa9'
  if (intensity < 0.75) return '#1D9E75'
  return '#0F6E56'
}

function hexToHue(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b)
  const delta = max - min
  if (delta === 0) return 0
  let h = max === r ? ((g - b) / delta) % 6 : max === g ? (b - r) / delta + 2 : (r - g) / delta + 4
  return Math.round(h * 60 + 360) % 360
}

function getColorAtIntensity(baseColor: string, sum: number, max: number): string {
  if (sum === 0 || max === 0) return 'rgba(128,128,128,0.1)'
  const hue = hexToHue(baseColor)
  const intensity = sum / max

  if (intensity < 0.25) return `hsl(${hue}, 50%, 35%)` // darkest — least active
  if (intensity < 0.5) return `hsl(${hue}, 60%, 38%)`
  if (intensity < 0.75) return `hsl(${hue}, 77%, 45%)`
  return `hsl(${hue}, 85%, 63%)` // brightest — most active
}

interface Props {
  heatmapInput: HeatmapDataByDayAndCalendar[]
  checkinItems: CheckinItemByDay[]
}

export default function Heatmap({ heatmapInput, checkinItems }: Props) {
  const [viewDate, setViewDate] = useState(new Date())
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; date: string } | null>(
    null
  )
  const [openModal, setOpenModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [monthlyCheckinItems, setMonthlyCheckinItems] = useState<CheckinItem[]>([])
  const [userDataPath, setUserDataPath] = useState<string>('')
  const [rerender, setRerender] = useState<boolean>(false)

  const [calendars, setCalendars] = useState<CalendarRows[]>()

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()

  const [hoverSummery, setHoverSummery] = useState<{
    x: number
    y: number
    date: string
    groups: HeatmapDataByDayAndCalendar[]
  } | null>(null)

  // const dateToHeatmapEntry = new Map(heatmapInput.map((d) => [d.date, d.total]))
  // const monthEntries = heatmapInput.filter((d) => {
  //   const [y, m] = d.date.split('-').map(Number)
  //   return y === year && m === month + 1
  // })
  // const maxTotal = Math.max(...monthEntries.map((d) => d.total), 1)

  const dateToHeatmapEntry = new Map<string, HeatmapDataByDayAndCalendar[]>()
  for (const entry of heatmapInput) {
    const existing = dateToHeatmapEntry.get(entry.date) ?? []
    existing.push(entry)
    dateToHeatmapEntry.set(entry.date, existing)
  }

  const groupMax = new Map<string, number>()
  for (const heatmapEntryArr of dateToHeatmapEntry.values()) {
    for (const entry of heatmapEntryArr) {
      groupMax.set(
        entry.calendar_name,
        Math.max(groupMax.get(entry.calendar_name) ?? 0, entry.total)
      )
    }
  }

  // fetch calendars
  useEffect(() => {
    const getCalendars = async () => {
      const temp = await window.api.getCalendars()
      setCalendars(temp)
    }
    getCalendars()
  }, [])

  //get userdatapath:
  useEffect(() => {
    window.api.getUserDataPath().then(setUserDataPath)
  })

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1)
  ]

  const handleRightClick = (e: React.MouseEvent, date: string) => {
    // e.preventDefault() // prevents the browser's default right click menu
    setContextMenu({ x: e.clientX, y: e.clientY, date })
  }

  const closeMenu = () => setContextMenu(null)

  const openCheckinModal = (date: string) => {
    setSelectedDate(date)
    setOpenModal(true)
  }

  function buildBackground(heatMapEntriesArray: HeatmapDataByDayAndCalendar[]): string {
    if (heatMapEntriesArray.length === 0) return 'rgba(128,128,128,0.1)'
    const dayTotal = heatMapEntriesArray.reduce((sum, entry) => sum + entry.total, 0)
    let cursor = 0
    const stops: string[] = []
    for (const entry of heatMapEntriesArray) {
      const end = cursor + (entry.total / dayTotal) * 100
      let color = entry.color ? entry.color : '#218648'

      stops.push(
        `${getColorAtIntensity(color, entry.total, groupMax.get(entry.calendar_name) ?? 1)} ${cursor.toFixed(1)}% ${end.toFixed(1)}%`
      )
      cursor = end
    }
    return `linear-gradient(to right, ${stops.join(', ')})`
  }

  const dateCheckinArrMap = new Map<string, CheckinItemByDay[]>()
  for (const item of checkinItems) {
    const existing = dateCheckinArrMap.get(item.date) ?? []
    existing.push(item)
    dateCheckinArrMap.set(item.date, existing)
  }

  return (
    <div
      style={{
        marginBottom: '1.5rem',
        width: '100%'
        // width: 500 // this is the width of the calandar
        // ,...DebugStyles.divOutline
      }}
    >
      <div
        style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 4 }}
      >
        {DAYS_OF_WEEK.map((d) => (
          <div
            key={d}
            style={{ fontSize: 10, color: 'grey', textAlign: 'center', paddingBottom: 4 }}
          >
            {d}
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
        {cells.map((day, i) => {
          if (day === null) return <div key={`empty-${i}`} />
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const total = dateToHeatmapEntry.get(dateStr) ?? 0
          const groups = dateToHeatmapEntry.get(dateStr) ?? []
          const todayStr = new Date().toLocaleDateString('en-CA') // en-CA gives YYYY-MM-DD format
          const isToday = todayStr === dateStr
          return (
            <div
              key={dateStr}
              style={{
                aspectRatio: '1',
                borderRadius: 6,
                // background: getColor(total, maxTotal),
                background: buildBackground(groups),
                display: 'flex',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                // justifyContent: 'center',
                padding: 5,
                fontSize: 11,
                color: groups.length > 0 ? 'white' : 'grey',
                border: isToday ? '2px solid #ac600ae0' : '0px solid transparent',
                cursor: 'default',
                boxSizing: 'border-box'
              }}
              onContextMenu={(e) => handleRightClick(e, dateStr)}
              onClick={closeMenu}
              onMouseLeave={() => setHoverSummery(null)}
              onMouseEnter={(e) =>
                setHoverSummery({ x: e.clientX, y: e.clientY, date: dateStr, groups: groups })
              }
            >
              {day}
              {(dateCheckinArrMap.get(dateStr) ?? []).map((ele) => (
                <img
                  key={ele.id}
                  src={`appicon://${userDataPath}/icons/${ele.iconLocation}`}
                  alt={ele.name}
                  width={'30%'}
                />
              ))}
            </div>
          )
        })}
        {contextMenu && (
          <ContextMenu {...contextMenu} closeMenu={closeMenu} openCheckinModal={openCheckinModal} />
        )}

        {hoverSummery && hoverSummery.groups.length > 0 && <ToolTipDateSummary {...hoverSummery} />}
      </div>

      {openModal && (
        <Modal onClose={() => setOpenModal(false)}>
          <CheckinCheckBoxes setRerender={setRerender} setOpen={setOpenModal} date={selectedDate} />
        </Modal>
      )}

      {calendars && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            width: '100%',
            flexWrap: 'wrap',
            marginTop: '10px'
          }}
        >
          {calendars.map((calendar) => (
            <div
              key={calendar.id}
              style={{
                fontSize: 11,
                display: 'flex',
                flexDirection: 'column',
                marginRight: '15px'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'row', gap: 6 }}>
                <p>{calendar.name}</p>
                {/* <p>Less</p> */}
                <div
                  style={{
                    ...styles.swatch,
                    backgroundColor: getColorAtIntensity(calendar.color, 5, 100)
                  }}
                />
                <div
                  style={{
                    ...styles.swatch,
                    backgroundColor: getColorAtIntensity(calendar.color, 35, 100)
                  }}
                />
                <div
                  style={{
                    ...styles.swatch,
                    backgroundColor: getColorAtIntensity(calendar.color, 55, 100)
                  }}
                />
                <div
                  style={{
                    ...styles.swatch,
                    backgroundColor: getColorAtIntensity(calendar.color, 80, 100)
                  }}
                />
                {/* <p>More</p> */}
              </div>
            </div>
          ))}
        </div>
      )}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          marginTop: 10,
          fontSize: 11,
          color: 'grey'
        }}
      >
        Less
        {['rgba(128,128,128,0.1)', '#9FE1CB', '#5DCAA5', '#1D9E75', '#0F6E56'].map((c, i) => (
          <div key={i} style={{ width: 13, height: 13, borderRadius: 3, background: c }} />
        ))}
        More
      </div>
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  swatch: {
    width: 13,
    height: 13,
    borderRadius: 3
  }
}
