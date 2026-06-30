import AutoStart from '@renderer/components/settings/AutoStart'
import Reminders from '@renderer/components/settings/Reminders'
import { JSX } from 'react'

export default function Settings(): JSX.Element {
  return (
    <div style={{ paddingLeft: '10px' }}>
      <Reminders />
      <AutoStart />
    </div>
  )
}
