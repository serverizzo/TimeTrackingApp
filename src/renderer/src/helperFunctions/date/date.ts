export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr + 'T00:00:00') // forces local time, not UTC
  return date.toLocaleDateString('en-US', {
    // weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
