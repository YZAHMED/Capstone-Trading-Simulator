import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { startSimulation, getProgress, SimulationProgress } from '../api/run'
import { getSimulation, Simulation } from '../api/simulations'

function RunPage() {
  const { id } = useParams<{ id: string }>()
  const [sim, setSim] = useState<Simulation | null>(null)
  const [progress, setProgress] = useState<SimulationProgress | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    async function init() {
      try {
        const s = await getSimulation(Number(id))
        setSim(s)
        if (s.status === 'draft') {
          await startSimulation(Number(id))
        }
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Could not start the simulation')
      }
    }
    init()
  }, [id])

  useEffect(() => {
    if (!id) return
    let cancelled = false

    async function tick() {
      try {
        const p = await getProgress(Number(id))
        if (!cancelled) setProgress(p)
      } catch (_) {
      }
    }

    const interval = setInterval(tick, 1000)
    tick()
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [id])

  const done = progress?.status === 'completed' || progress?.status === 'failed'
  const pct = progress && progress.total > 0
    ? Math.min(100, Math.round((progress.completed / progress.total) * 100))
    : 0

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">
        {sim ? `${sim.name} (${sim.symbol})` : 'Running...'}
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        Status: {progress?.status || sim?.status || 'starting'}
      </p>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      <div className="bg-white shadow rounded p-6">
        <p className="text-gray-700 mb-2">
          Progress: {progress?.completed ?? 0} / {progress?.total ?? sim?.num_transactions ?? 0}
        </p>
        <div className="w-full bg-gray-200 rounded h-5 overflow-hidden">
          <div
            className="h-full bg-gray-800 transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-right text-sm text-gray-600 mt-1">{pct}%</p>
      </div>

      {done ? (
        <div className="mt-6">
          <Link to="/dashboard" className="text-blue-600 hover:underline">
            Back to dashboard
          </Link>
        </div>
      ) : (
        <p className="text-sm text-gray-500 mt-6">
          This page polls the backend every second.
        </p>
      )}
    </div>
  )
}

export default RunPage
