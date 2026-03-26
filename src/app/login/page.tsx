'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async () => {
    setError('')
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      })

      if (!res.ok) {
        setError('Invalid password')
        return
      }

      window.location.href = '/'
    } catch {
      setError('Login failed')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin()
    }
  }

  return (
    <div className="min-h-screen bg-space-dark flex items-center justify-center">
      <div className="bg-space-dark p-8 rounded-lg border border-space-border max-w-sm w-full">
        <h1 className="text-2xl font-bold text-hud-text mb-2">Mission Control</h1>
        <p className="text-hud-muted text-sm mb-6">Enter password to access</p>

        <div className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Password"
            className="w-full px-4 py-3 bg-space-dark border border-space-border rounded-lg text-hud-text placeholder-hud-muted focus:outline-none focus:border-hud-amber"
          />

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="button"
            onClick={handleLogin}
            className="w-full bg-blue-600 hover:bg-blue-900/300 text-white font-medium py-3 rounded-lg transition-colors"
          >
            Access Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}
