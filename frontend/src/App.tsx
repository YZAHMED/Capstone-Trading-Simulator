import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { api } from './api/client'
import NavBar from './components/NavBar'
import RegisterPage from './pages/RegisterPage'
import LoginPage from './pages/LoginPage'

function Home() {
  const { user } = useAuth()
  const [status, setStatus] = useState<string>('checking...')

  useEffect(() => {
    api.get('/health')
      .then((res) => setStatus(res.data.status))
      .catch(() => setStatus('cannot reach backend'))
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <div className="max-w-5xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-gray-800">Trading Simulator</h1>
        <p className="mt-2 text-gray-600">Backend status: {status}</p>
        {user ? (
          <p className="mt-4 text-gray-700">Welcome back, {user.username}!</p>
        ) : (
          <p className="mt-4 text-gray-700">Please log in or create an account to get started.</p>
        )}
      </div>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
