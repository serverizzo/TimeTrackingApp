import { act, JSX, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function SyncToCloudRoute(): JSX.Element {
  const navigate = useNavigate()
  const [loading, setLoading] = useState<boolean>(false)
  const [status, setStatus] = useState<string>('')

  const handleSync = async (): Promise<void> => {
    const token = await window.api.getToken()
    if (!token) {
      console.log('token not found')
      navigate('/loginToCloud')
      return
    } else {
      console.log('token found')
      setLoading(true)

      try {
        const calendars = await window.api.getCalendars()
        const activities = await window.api.getActivities()

        // create a lookup map of calendar name -> id
        const calendarMap = new Map(calendars.map((c: any) => [c.name, c.id]))

        console.log(calendars)
        console.log(activities)

        const mappedActivities = activities.map((a: any) => ({
          id: a.id,
          name: a.name,
          is_tracked_in_laps: a.isTrackedInLaps ? 1 : 0,
          is_tracked_in_checkin: a.isTrackedInCheckin ? 1 : 0,
          calendar_id: calendarMap.get(a.calendar) ?? null
        }))

        // calendars must be synced first since activities has a fk relationship
        const calendarRes = await fetch(`${import.meta.env.VITE_API_URL}/sync/calendars`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ calendars })
        })

        if (!calendarRes.ok) {
          throw new Error('Calendar sync failed')
        }

        const activitiesRes = await fetch(`${import.meta.env.VITE_API_URL}/sync/activities`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ activities: mappedActivities })
        })

        if (!activitiesRes.ok) throw new Error('Activities sync failed')

        setStatus('Sync complete!')
      } catch (err: any) {
        setStatus(err.message ?? 'Sync failed')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
  }
  const removeToken = (): void => {
    window.api.deleteToken()
  }

  return (
    <div>
      SyncToCloudRoute
      <button onClick={handleSync}>sync activities</button>
      <button onClick={removeToken}>remove token</button>
      {loading && <p>Syncing activities</p>}
      {status && <p style={{ marginTop: 12 }}>{status}</p>}
    </div>
  )
}
