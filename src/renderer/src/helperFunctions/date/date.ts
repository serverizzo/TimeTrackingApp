export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr + 'T00:00:00') // forces local time, not UTC
  return date.toLocaleDateString('en-US', {
    // weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export const formatDateWithDay = (dateStr: string): string => {
  const date = new Date(dateStr + 'T00:00:00') // forces local time, not UTC
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
export const removeSeconds = (inputTime: string): string => {
  const [hourMin, ampm] = inputTime.split(' ')
  const [hour, min, sec] = hourMin.split(':')
  return `${hour}:${min} ${ampm}`
}

export function getEndTime(startTimeStr, msElapsed) {
  const [time, period] = startTimeStr.split(' ')
  const [hours, minutes, seconds] = time.split(':').map(Number)

  // Convert to 24hr
  let hours24 = hours
  if (period === 'PM' && hours !== 12) hours24 += 12
  if (period === 'AM' && hours === 12) hours24 = 0

  // Build a Date, add ms
  const date = new Date()
  date.setHours(hours24, minutes, seconds, 0)
  date.setMilliseconds(date.getMilliseconds() + msElapsed)

  // Format back to 12hr
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    // second: '2-digit',
    hour12: true
  })
}

export const msToMins = (millisecondsInput: number): string => {
  return String(Math.round(millisecondsInput / 60000)) + 'm'
}
