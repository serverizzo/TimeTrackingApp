import { JSX } from 'react'

export default function Settings(): JSX.Element {
  const executeFlash = (): void => {
    setTimeout(() => {
      window.api.flashWindow()
      console.log('it should now trigger')
    }, 3000)
  }

  return (
    <div>
      <button onClick={() => executeFlash()}>Remind me that my app is still running</button>
    </div>
  )
}
