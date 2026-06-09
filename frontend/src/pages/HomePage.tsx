import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { api } from '../api/client'

function HomePage() {
  const { user } = useAuth()
  const [status, setStatus] = useState<string>('checking...')

  useEffect(() => {
    api.get('/health')
      .then((res) => setStatus(res.data.status))
      .catch(() => setStatus('cannot reach backend'))
  }, [])

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 text-center">
      <h1 className="text-2xl font-bold text-gray-800">Trading Simulator</h1>
      <p className="mt-2 text-sm text-gray-500">Backend status: {status}</p>

      {user ? (
        <div className="mt-6">
          <p className="text-gray-700">Welcome back, {user.username}.</p>
          <p className="text-sm text-gray-500 mt-1">You are logged in as a {user.role}.</p>
        </div>
      ) : (
        <p className="mt-4 text-gray-700">
          Please log in or create an account to get started.
        </p>
      )}
    </div>
  )
}

export default HomePage
