import { JSX } from 'react'
import { useNavigate } from 'react-router-dom'

export default function SyncToCloudRoute(): JSX.Element {
  const navigate = useNavigate()

  const handleSync = async (): Promise<void> => {
    const token = await window.api.getToken()
    if (!token) {
      console.log('token not found')
      navigate('/loginToCloud')
      return
    } else {
      console.log('token found')
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
    </div>
  )
}
