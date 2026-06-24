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

function Card({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: 'pass' | 'fail' }) {
  const valueColor =
    tone === 'pass' ? 'text-green-700' : tone === 'fail' ? 'text-red-600' : 'text-gray-800'
  return (
    <div className="bg-white shadow rounded p-4 text-center">
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`text-xl font-bold mt-1 ${valueColor}`}>{value}</p>
      {sub && <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>}
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

  const passed = data.points.filter((p) => p.success).length
  const failed = data.points.length - passed
  const requested = sim.num_transactions
  const actual = data.total
  const hitLimit = actual < requested
  const neededDuration = Math.ceil(requested / Math.max(sim.rate_per_second, 1))
  const neededRate = Math.ceil(requested / Math.max(sim.duration_seconds, 1))

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

      <div className="bg-gray-50 border border-gray-200 rounded p-4 mb-4 text-sm text-gray-700">
        <p>
          <span className="font-semibold">You asked for</span> {requested} transactions at {sim.rate_per_second}/second for a max of {sim.duration_seconds} seconds.
        </p>
        <p className="mt-1">
          <span className="font-semibold">The simulation actually sent</span> {actual} transactions. Of those, {passed} passed and {failed} failed.
        </p>
      </div>

      {hitLimit && (
        <div className="bg-amber-50 border border-amber-200 rounded p-4 mb-6 text-sm">
          <p className="font-semibold text-amber-900 mb-2">
            The simulation hit the duration limit before sending all {requested} transactions.
          </p>
          <p className="text-amber-800 leading-relaxed">
            At {sim.rate_per_second} transactions per second for {sim.duration_seconds} seconds,
            the most we can fit in is {sim.rate_per_second * sim.duration_seconds} transactions.
            That is why the run stopped at {actual}.
          </p>
          <p className="text-amber-800 leading-relaxed mt-2">
            To complete all {requested} transactions, edit the simulation and either:
          </p>
          <ul className="list-disc list-inside text-amber-800 mt-1 ml-2 space-y-0.5">
            <li>Increase <span className="font-semibold">Duration</span> to at least {neededDuration} seconds (so {sim.rate_per_second} per second has time to send {requested}), or</li>
            <li>Increase <span className="font-semibold">Rate per second</span> to at least {neededRate} per second (so {requested} can fit in {sim.duration_seconds} seconds).</li>
          </ul>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
        <Card
          label="Total sent"
          value={String(actual)}
          sub={hitLimit ? `of ${requested} requested` : `of ${requested} requested`}
        />
        <Card label="Passed" value={String(passed)} tone="pass" />
        <Card label="Failed" value={String(failed)} tone={failed > 0 ? 'fail' : undefined} />
        <Card label="Success rate" value={`${data.success_rate}%`} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-2 gap-3 mb-3">
        <Card label="Avg response time" value={`${data.avg_latency_ms} ms`} />
        <Card label="Slowest 5% (p95)" value={`${data.p95_latency_ms} ms`} />
      </div>

      <p className="text-xs text-gray-500 mb-6 leading-relaxed">
        Total sent vs requested. Passed is the number of transactions that succeeded.
        Failed is the number that did not. Success rate is the percentage passed.
        Avg response time is the average time in milliseconds.
        Slowest 5% (p95 latency) means 95 percent of transactions were faster than this number.
      </p>

      {compareData && (
        <>
          <h3 className="text-sm font-semibold text-gray-700 mb-2 mt-6">
            Compared simulation: {compareData.simulation.name} ({compareData.simulation.symbol})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
            <Card
              label="Compare total sent"
              value={String(compareData.total)}
              sub={`of ${compareData.simulation.num_transactions} requested`}
            />
            <Card
              label="Compare passed"
              value={String(compareData.points.filter((p) => p.success).length)}
              tone="pass"
            />
            <Card
              label="Compare failed"
              value={String(compareData.points.length - compareData.points.filter((p) => p.success).length)}
              tone={
                compareData.points.length - compareData.points.filter((p) => p.success).length > 0
                  ? 'fail'
                  : undefined
              }
            />
            <Card label="Compare success rate" value={`${compareData.success_rate}%`} />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-2 gap-3 mb-6">
            <Card label="Compare avg response time" value={`${compareData.avg_latency_ms} ms`} />
            <Card label="Compare slowest 5%" value={`${compareData.p95_latency_ms} ms`} />
          </div>
        </>
      )}

      <div className="bg-white shadow rounded p-4">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h2 className="text-sm font-semibold text-gray-700">Response time over time (ms)</h2>
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
              <XAxis dataKey="tx" stroke="#6b7280" fontSize={12} label={{ value: 'Transaction number', position: 'insideBottom', offset: -2, fontSize: 11, fill: '#6b7280' }} />
              <YAxis stroke="#6b7280" fontSize={12} label={{ value: 'Response time (ms)', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#6b7280' }} />
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
