import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { api } from './api/client'
import RegisterPage from './pages/RegisterPage'

function Home() {
  const [status, setStatus] = useState<string>('checking...')

  useEffect(() => {
    api.get('/health')
      .then((res) => setStatus(res.data.status))
      .catch(() => setStatus('cannot reach backend'))
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white shadow rounded-lg p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-800">Trading Simulator</h1>
        <p className="mt-2 text-gray-600">Backend status: {status}</p>
        <Link to="/register" className="inline-block mt-4 text-blue-600 hover:underline">
          Create an account
        </Link>
      </div>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
