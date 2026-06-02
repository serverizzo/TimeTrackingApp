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

export const msToMins = (millisecondsInput: number): string => {
  return String(Math.round(millisecondsInput / 60000)) + 'm'
}
