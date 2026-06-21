import { useEffect, useState } from 'react'
import {
  LineChart, Line,
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { getAnalyticsSummary, AnalyticsSummary } from '../api/analytics'

function AnalyticsPage() {
  // what: the analyst's main dashboard. shows totals and two charts
  // gets: nothing from props. range comes from a dropdown that controls what data we ask for
  // does: holds the range as state ("last7", "last30" or "all")
  // a useEffect re-runs whenever range changes. it calls getAnalyticsSummary(range)
  // when new data comes back, the two recharts (LineChart for daily latency, BarChart for daily runs) redraw
  // returns: the page with two summary tiles (total simulations and average latency)
  // and the two charts. an empty state if there are no rows yet
  const [range, setRange] = useState('last30')
  const [data, setData] = useState<AnalyticsSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    // fires on mount and every time range changes (because the analyst picked a different option)
    setLoading(true)
    setError('')
    getAnalyticsSummary(range)
      .then(setData)
      .catch(() => setError('Could not load analytics. Please try again.'))
      .finally(() => setLoading(false))
  }, [range])

  if (loading && !data) {
    return <div className="max-w-5xl mx-auto px-4 py-8 text-gray-500">Loading...</div>
  }
  if (error) {
    return <div className="max-w-5xl mx-auto px-4 py-8 text-red-600">{error}</div>
  }
  if (!data) return null

  // map the backend's day/value objects into the shapes recharts expects
  const hasData = data.daily_runs.length > 0 || data.daily_avg_latency.length > 0
  const latencyData = data.daily_avg_latency.map((d) => ({ day: d.day, latency: d.value }))
  const runsData = data.daily_runs.map((d) => ({ day: d.day, runs: d.value }))

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Analytics</h1>
        <div className="flex items-center text-sm space-x-2">
          <label className="text-gray-600">Range:</label>
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1"
          >
            <option value="last7">Last 7 days</option>
            <option value="last30">Last 30 days</option>
            <option value="all">All time</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white shadow rounded p-4">
          <p className="text-xs text-gray-500">Total simulations</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">
            {data.total_simulations.toLocaleString()}
          </p>
        </div>
        <div className="bg-white shadow rounded p-4">
          <p className="text-xs text-gray-500">Average response time (all time, ms)</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">
            {data.avg_latency_all_time} ms
          </p>
        </div>
      </div>

      {!hasData ? (
        <p className="text-gray-500">No simulations have been run yet.</p>
      ) : (
        <>
          <div className="bg-white shadow rounded p-4 mb-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-2">
              Average response time by day (ms)
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={latencyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="day" stroke="#6b7280" fontSize={11} />
                  <YAxis stroke="#6b7280" fontSize={11} />
                  <Tooltip />
                  <Line type="monotone" dataKey="latency" stroke="#374151" strokeWidth={1.5} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white shadow rounded p-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-2">
              Simulations run by day
            </h2>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={runsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="day" stroke="#6b7280" fontSize={11} />
                  <YAxis stroke="#6b7280" fontSize={11} />
                  <Tooltip />
                  <Bar dataKey="runs" fill="#374151" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default AnalyticsPage
