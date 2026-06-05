import { useEffect, useState } from 'react'
import axios from 'axios'

const API_URL = 'http://localhost:8000'

function App() {
  const [status, setStatus] = useState<string>('checking...')

  useEffect(() => {
    axios.get(`${API_URL}/health`)
      .then((res) => setStatus(res.data.status))
      .catch(() => setStatus('cannot reach backend'))
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white shadow rounded-lg p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-800">Trading Simulator</h1>
        <p className="mt-2 text-gray-600">Backend status: {status}</p>
      </div>
    </div>
  )
}

export default App
