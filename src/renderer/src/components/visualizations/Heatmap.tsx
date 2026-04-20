import { useEffect, useState } from 'react'
import { HeatmapEntry } from './types'
import { DebugStyles } from '@renderer/styles.ts/debugStyle'
import Modal from '../general/checkinModal'
import CheckinCheckBoxes from '../general/checkinCheckBoxes'

interface Props {
  data: HeatmapEntry[]
}

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function getColor(total: number, max: number): string {
  if (total === 0 || max === 0) return 'rgba(128,128,128,0.1)'
  const intensity = total / max
  if (intensity < 0.25) return '#9FE1CB'
  if (intensity < 0.5) return '#5DCAA5'
  if (intensity < 0.75) return '#1D9E75'
  return '#0F6E56'
}

interface CheckinItem {
  date: string
  id: number
  name: string
  iconLocation: string
}

export default function Calendar({ data }: Props) {
  const [viewDate, setViewDate] = useState(new Date())
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; date: string } | null>(
    null
  )
  const [openModal, setOpenModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [monthlyCheckinItems, setMonthlyCheckinItems] = useState<CheckinItem[]>([])
  const [triggerRefresh, setTriggerRefresh] = useState<boolean>(false)
  const [userDataPath, setUserDataPath] = useState<string>('')
  const [rerender, setRerender] = useState<boolean>(false)

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()

  const dataMap = new Map(data.map((d) => [d.date, d.total]))
  const monthEntries = data.filter((d) => {
    const [y, m] = d.date.split('-').map(Number)
    return y === year && m === month + 1
  })
  const maxTotal = Math.max(...monthEntries.map((d) => d.total), 1)

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1)
  ]

  const shiftMonth = (delta: number) => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1))
  }

  const handleRightClick = (e: React.MouseEvent, date: string) => {
    // e.preventDefault() // prevents the browser's default right click menu
    setContextMenu({ x: e.clientX, y: e.clientY, date })
  }

  const closeMenu = () => setContextMenu(null)

  const openCheckInModal = (date: string) => {
    setSelectedDate(date)
    setOpenModal(true)
  }

  useEffect(() => {
    window.api.getUserDataPath().then(setUserDataPath)
    const startDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1)
      .toISOString()
      .split('T')[0]
    const endDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0)
      .toISOString()
      .split('T')[0]
    window.api.getCheckedActivitiesByMonth(startDate, endDate).then(setMonthlyCheckinItems)

    // todo: have this trigger on exiting modal (use trigger refresh)
  }, [rerender])

  return (
    <div
      style={{
        marginBottom: '1.5rem',
        width: 500 // this is the width of the calandar
        // ,...DebugStyles.divOutline
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <button onClick={() => shiftMonth(-1)}>←</button>
        <span style={{ fontSize: 13, color: 'grey', minWidth: 120, textAlign: 'center' }}>
          {viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </span>
        <button onClick={() => shiftMonth(1)}>→</button>
      </div>

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
          const total = dataMap.get(dateStr) ?? 0
          const isToday = new Date().toISOString().split('T')[0] === dateStr
          return (
            <div
              key={dateStr}
              style={{
                aspectRatio: '1',
                borderRadius: 6,
                background: getColor(total, maxTotal),
                display: 'flex',
                // alignItems: 'center',
                // justifyContent: 'center',
                padding: 5,
                fontSize: 11,
                color: total > 0 ? 'white' : 'grey',
                border: isToday ? '2px solid #ac600ae0' : '0px solid transparent',
                cursor: 'default',
                boxSizing: 'border-box'
              }}
              onContextMenu={(e) => handleRightClick(e, dateStr)}
              onClick={closeMenu}
            >
              {day}
              {monthlyCheckinItems &&
                monthlyCheckinItems
                  .filter((ele) => ele.date === dateStr)
                  .map((ele) => (
                    <img
                      key={ele.id}
                      src={`appicon://${userDataPath}/icons/${ele.iconLocation}`}
                      alt={ele.name}
                      width={24}
                      height={24}
                    />
                  ))}
              {/* <img src={runningIcon} alt="running" width={24} height={24} /> */}
              {/* <img src={walkingIcon} alt="running" width={24} height={24} /> */}
            </div>
          )
        })}
        {contextMenu && (
          <div
            style={{
              position: 'fixed',
              top: contextMenu.y,
              left: contextMenu.x,
              background: 'white',
              border: '0.5px solid grey',
              borderRadius: 4,
              padding: '4px 0',
              zIndex: 1000,
              minWidth: 160
            }}
            onMouseLeave={closeMenu}
          >
            <div
              style={{ padding: '8px 12px', fontSize: 13, color: 'gray', cursor: 'pointer' }}
              onClick={() => {
                console.log('Jump to', contextMenu.date)
              }}
            >
              {contextMenu.date}
            </div>
            <div
              style={{ padding: '8px 12px', fontSize: 12, color: 'grey', cursor: 'pointer' }}
              onClick={() => openCheckInModal(contextMenu.date)}
            >
              Update checkins
            </div>
            <hr style={{ margin: '4px 0', borderColor: 'rgba(128,128,128,0.2)' }} />
            <div
              style={{ padding: '8px 12px', fontSize: 13, color: 'gray', cursor: 'pointer' }}
              onClick={() => {
                console.log('Jump to', contextMenu.date)
              }}
            >
              Jump to this week
            </div>
          </div>
        )}
      </div>

      {openModal && (
        <Modal onClose={() => setOpenModal(false)}>
          <CheckinCheckBoxes setRerender={setRerender} setOpen={setOpenModal} date={selectedDate} />
        </Modal>
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
