import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getResults, SimulationResults } from '../api/run'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white shadow rounded p-4 text-center">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-xl font-bold text-gray-800 mt-1">{value}</p>
    </div>
  )
}

function ResultsPage() {
  const { id } = useParams<{ id: string }>()
  const [data, setData] = useState<SimulationResults | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    getResults(Number(id))
      .then((d) => setData(d))
      .catch(() => setError('Could not load the results'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return <div className="max-w-5xl mx-auto px-4 py-8 text-gray-500">Loading...</div>
  }
  if (error || !data) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 text-red-600">
        {error || 'No data available.'}
      </div>
    )
  }

  const sim = data.simulation

  const step = Math.max(1, Math.floor(data.points.length / 200))
  const chartData = data.points
    .filter((_, i) => i % step === 0)
    .map((p) => ({ tx: p.transaction_number, latency: p.latency_ms }))

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">
        {sim.name} ({sim.symbol})
      </h1>
      <p className="text-sm text-gray-500 mb-6">Status: {sim.status}</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Card label="Total" value={String(data.total)} />
        <Card label="Success rate" value={`${data.success_rate}%`} />
        <Card label="Avg latency" value={`${data.avg_latency_ms} ms`} />
        <Card label="p95 latency" value={`${data.p95_latency_ms} ms`} />
      </div>

      <div className="bg-white shadow rounded p-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-2">Latency over time</h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="tx" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="latency"
                stroke="#374151"
                strokeWidth={1.5}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-6">
        <Link to="/dashboard" className="text-blue-600 hover:underline">
          Back to dashboard
        </Link>
      </div>
    </div>
  )
}

export default ResultsPage
