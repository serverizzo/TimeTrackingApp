import Fastify from 'fastify'
import { getDb } from '../database'

const server = Fastify({ logger: false })

export const startLocalFastifyServer = (): void => {
  server.post('/sync/laps', async (request, reply) => {
    const { laps } = request.body as {
      laps: {
        timestarted: string
        date: string
        lap_time: number
        note: string | null
        comments: string | null
        source: string
        calendar: number | null
      }[]
    }

    try {
      const db = getDb()

      const normalize = (name: string): string => name.trim().toLowerCase()

      const getActivityByName = db.prepare(`
      SELECT id FROM activities WHERE LOWER(TRIM(name)) = ?
    `)

      const insertActivity = db.prepare(`
        INSERT INTO activities (name, calendar, isTrackedInLaps, isTrackedInCheckin)
        VALUES (?, ?, 1, 0)
      `)

      const insertLap = db.prepare(`
      INSERT OR IGNORE INTO laps (timestarted, date, lap_time, note, source, calendar)
      VALUES (@timestarted, @date, @lapTime, @note, @source, @calendar)
    `)

      const processLaps = db.transaction((laps) => {
        for (const lap of laps) {
          if (lap.note) {
            const existing = getActivityByName.get(normalize(lap.note))
            if (!existing) {
              insertActivity.run(lap.note.trim(), lap.calendar)
            }
          }

          insertLap.run({
            timestarted: lap.timestarted,
            date: lap.date,
            lapTime: lap.lap_time,
            note: lap.note,
            source: lap.source,
            calendar: lap.calendar
          })
        }
      })

      processLaps(laps)
      return reply.send({ success: true })
    } catch (err) {
      server.log.error(err)
      return reply.status(500).send({ error: 'Internal server error' })
    }
  })

  server.post('/sync/checkins', async (request, reply) => {
    const { checkins } = request.body as {
      checkins: {
        activity_id: number
        date: string
      }[]
    }

    try {
      const db = getDb()
      const insert = db.prepare(`
        INSERT OR IGNORE INTO daily_activities (date, activity_id)
        VALUES (@date, @activityId)
      `)

      const insertMany = db.transaction((checkins) => {
        for (const checkin of checkins)
          insert.run({
            date: checkin.date,
            activityId: checkin.activity_id
          })
      })

      insertMany(checkins)
      return reply.send({ success: true })
    } catch (err) {
      server.log.error(err)
      return reply.status(500).send({ error: 'Internal server error' })
    }
  })

  server.get('/activities', async (request, reply) => {
    try {
      const db = getDb()
      const activities = db
        .prepare(
          `
        SELECT a.id, a.name, a.iconLocation, a.isTrackedInLaps, a.isTrackedInCheckin,
               c.id as calendar_id, c.name as calendar_name
        FROM activities a
        LEFT JOIN calendars c ON a.calendar = c.id
        ORDER BY a.name
      `
        )
        .all()

      return reply.send({ activities })
    } catch (err) {
      server.log.error(err)
      return reply.status(500).send({ error: 'Internal server error' })
    }
  })

  server.listen({ port: 4321, host: '0.0.0.0' }, (err) => {
    if (err) {
      console.error('Local server error:', err)
    } else {
      console.log('Local Fastify server running on port 4321')
    }
  })
}

export const stopLocalServer = (): void => {
  server.close()
}
