import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getResults, SimulationResults } from '../api/run'
import { listSimulations } from '../api/simulations'
import { getHistory } from '../api/analytics'
import { useAuth } from '../context/AuthContext'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface SimOption {
  id: number
  name: string
  symbol: string
}

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
  const { user } = useAuth()
  const [data, setData] = useState<SimulationResults | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [options, setOptions] = useState<SimOption[]>([])
  const [compareId, setCompareId] = useState<number | null>(null)
  const [compareData, setCompareData] = useState<SimulationResults | null>(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getResults(Number(id))
      .then((d) => setData(d))
      .catch(() => setError('Could not load the results'))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (!user || !id) return
    if (user.role === 'trader') {
      listSimulations()
        .then((sims) => {
          setOptions(
            sims
              .filter((s) => s.status === 'completed' && s.id !== Number(id))
              .map((s) => ({ id: s.id, name: s.name, symbol: s.symbol }))
          )
        })
        .catch(() => {})
    } else if (user.role === 'analyst') {
      getHistory()
        .then((items) => {
          setOptions(
            items
              .filter((h) => h.status === 'completed' && h.id !== Number(id))
              .map((h) => ({ id: h.id, name: h.name, symbol: h.symbol }))
          )
        })
        .catch(() => {})
    }
  }, [user, id])

  useEffect(() => {
    if (compareId === null) {
      setCompareData(null)
      return
    }
    getResults(compareId)
      .then((d) => setCompareData(d))
      .catch(() => setCompareData(null))
  }, [compareId])

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

  const merged = new Map<number, { tx: number; current?: number; compare?: number }>()
  for (const p of data.points) {
    merged.set(p.transaction_number, { tx: p.transaction_number, current: p.latency_ms })
  }
  if (compareData) {
    for (const p of compareData.points) {
      const row = merged.get(p.transaction_number) || { tx: p.transaction_number }
      row.compare = p.latency_ms
      merged.set(p.transaction_number, row)
    }
  }
  const allPoints = Array.from(merged.values()).sort((a, b) => a.tx - b.tx)
  const step = Math.max(1, Math.floor(allPoints.length / 200))
  const chartData = allPoints.filter((_, i) => i % step === 0)

  const backTo = user?.role === 'analyst' ? '/history' : '/dashboard'
  const backLabel = user?.role === 'analyst' ? 'Back to history' : 'Back to dashboard'

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

      {compareData && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <Card label="Compare total" value={String(compareData.total)} />
          <Card label="Compare success rate" value={`${compareData.success_rate}%`} />
          <Card label="Compare avg latency" value={`${compareData.avg_latency_ms} ms`} />
          <Card label="Compare p95 latency" value={`${compareData.p95_latency_ms} ms`} />
        </div>
      )}

      <div className="bg-white shadow rounded p-4">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h2 className="text-sm font-semibold text-gray-700">Latency over time</h2>
          {options.length > 0 && (
            <div className="flex items-center text-sm space-x-2">
              <label className="text-gray-600">Compare with:</label>
              <select
                value={compareId ?? ''}
                onChange={(e) => setCompareId(e.target.value ? Number(e.target.value) : null)}
                className="border border-gray-300 rounded px-2 py-1 text-sm"
              >
                <option value="">(none)</option>
                {options.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name} ({o.symbol})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="tx" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="current"
                name={sim.name}
                stroke="#374151"
                strokeWidth={1.5}
                dot={false}
              />
              {compareData && (
                <Line
                  type="monotone"
                  dataKey="compare"
                  name={compareData.simulation.name}
                  stroke="#dc2626"
                  strokeWidth={1.5}
                  dot={false}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-6">
        <Link to={backTo} className="text-blue-600 hover:underline">
          {backLabel}
        </Link>
      </div>
    </div>
  )
}

export default ResultsPage
