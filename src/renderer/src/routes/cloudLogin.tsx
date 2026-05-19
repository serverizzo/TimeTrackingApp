import { json } from 'd3'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function CloudLogin() {
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [togglePassword, setTogglePassword] = useState<boolean>(true)

  const [error, setError] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)

  const navigate = useNavigate()

  const handleLogin = async () => {
    setLoading(true)
    setError('')

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Something went wrong, try again')
        return
      }
      await window.api.saveToken(data.token)
      navigate('/syncToCloud')
    } catch {
      setError('Could not connect to the server')
    } finally {
      setLoading(false)
    }
  }
  return (
    <div>
      CloudLogin
      <p>Please login before syncing</p>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <input
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="email"
          value={email}
        />
        <input
          onChange={(e) => setPassword(e.target.value)}
          type={togglePassword ? 'password' : 'text'}
          placeholder="password"
          value={password}
        />
        <button onClick={() => setTogglePassword((prev) => !prev)}>
          {togglePassword ? 'show password' : 'hide password'}
        </button>
        <button onClick={handleLogin}>Login</button>
      </div>
    </div>
  )
}
