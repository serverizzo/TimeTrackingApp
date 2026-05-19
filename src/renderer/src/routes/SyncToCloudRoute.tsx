import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function SyncToCloudRoute() {
  const navigate = useNavigate()

  const handleSync = async () => {
    const token = await window.api.getToken()
    if (!token) {
      console.log('token not found')
      navigate('/loginToCloud')
      return
    } else {
      console.log('token found')
    }
  }
  const removeToken = () => {
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
