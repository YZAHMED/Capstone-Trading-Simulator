import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getSimulation, updateSimulation } from '../api/simulations'

function EditSimulationPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [symbol, setSymbol] = useState('')
  const [numTransactions, setNumTransactions] = useState('')
  const [ratePerSecond, setRatePerSecond] = useState('')
  const [durationSeconds, setDurationSeconds] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!id) return
    getSimulation(Number(id))
      .then((s) => {
        setName(s.name)
        setSymbol(s.symbol)
        setNumTransactions(String(s.num_transactions))
        setRatePerSecond(String(s.rate_per_second))
        setDurationSeconds(String(s.duration_seconds))
      })
      .catch(() => setError('Could not load this simulation'))
      .finally(() => setLoading(false))
  }, [id])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!id) return
    setError('')
    setSaving(true)
    try {
      await updateSimulation(Number(id), {
        name,
        symbol,
        num_transactions: Number(numTransactions),
        rate_per_second: Number(ratePerSecond),
        duration_seconds: Number(durationSeconds),
      })
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Could not save')
    } finally {
      setSaving(false)
    }
  }

  const n = Number(numTransactions)
  const r = Number(ratePerSecond)
  const d = Number(durationSeconds)
  const valid = n > 0 && r > 0 && d > 0
  const maxFitsInTime = r * d
  const willFit = valid && n <= maxFitsInTime
  const projectedTotal = valid ? Math.min(n, maxFitsInTime) : 0
  const projectedSeconds = valid ? Math.min(d, Math.ceil(n / Math.max(r, 1))) : 0
  const neededDuration = valid ? Math.ceil(n / Math.max(r, 1)) : 0
  const neededRate = valid ? Math.ceil(n / Math.max(d, 1)) : 0

  if (loading) {
    return <div className="max-w-2xl mx-auto px-4 py-8 text-gray-500">Loading...</div>
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Edit simulation</h1>
      <p className="text-sm text-gray-600 mb-6 leading-relaxed">
        The simulation will run in the background and stop as soon as either
        all the requested trades have been sent OR the duration limit is
        reached, whichever comes first.
      </p>

      <form onSubmit={handleSubmit} className="bg-white shadow rounded p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-1 w-full border border-gray-300 rounded px-3 py-2"
          />
          <p className="text-xs text-gray-500 mt-1">A label so you can tell your simulations apart later.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Symbol *</label>
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            required
            maxLength={10}
            className="mt-1 w-32 border border-gray-300 rounded px-3 py-2"
          />
          <p className="text-xs text-gray-500 mt-1">The stock symbol the fake trades will be tagged with. Used only as a label.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Transactions *</label>
            <input
              type="number"
              value={numTransactions}
              onChange={(e) => setNumTransactions(e.target.value)}
              required
              min={1}
              className="mt-1 w-full border border-gray-300 rounded px-3 py-2"
            />
            <p className="text-xs text-gray-500 mt-1">How many fake trades to send in total.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Rate per second *</label>
            <input
              type="number"
              value={ratePerSecond}
              onChange={(e) => setRatePerSecond(e.target.value)}
              required
              min={1}
              className="mt-1 w-full border border-gray-300 rounded px-3 py-2"
            />
            <p className="text-xs text-gray-500 mt-1">How fast to send them (trades per second).</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Duration (seconds) *</label>
            <input
              type="number"
              value={durationSeconds}
              onChange={(e) => setDurationSeconds(e.target.value)}
              required
              min={1}
              className="mt-1 w-full border border-gray-300 rounded px-3 py-2"
            />
            <p className="text-xs text-gray-500 mt-1">Max time the simulation can run before it stops.</p>
          </div>
        </div>

        {valid && (
          <>
            <div className={`rounded p-4 text-sm border ${willFit ? 'bg-green-50 border-green-200 text-green-900' : 'bg-amber-50 border-amber-200 text-amber-900'}`}>
              <p className="font-semibold mb-1">
                {willFit ? 'Capacity: this configuration fits' : 'Capacity: this will hit the duration limit'}
              </p>
              {willFit ? (
                <p className="leading-relaxed">
                  {r} per second for up to {d} seconds can send {maxFitsInTime} transactions.
                  You asked for {n}, which will finish in about {projectedSeconds} seconds.
                  Expected total transactions sent: {projectedTotal}.
                </p>
              ) : (
                <>
                  <p className="leading-relaxed">
                    {r} per second for {d} seconds can only send {maxFitsInTime} transactions.
                    You asked for {n}, so the run will stop early at about {projectedTotal} transactions when the duration limit is hit.
                  </p>
                  <p className="leading-relaxed mt-2">
                    To complete all {n}: set Duration to at least {neededDuration} seconds OR set Rate per second to at least {neededRate}.
                  </p>
                </>
              )}
            </div>

            <div className={`rounded p-4 text-sm border ${stressBoxClass(r)}`}>
              <p className="font-semibold mb-1">Stress: {stressLabelFor(r)}</p>
              <p className="leading-relaxed">{stressDescriptionFor(r)}</p>
            </div>
          </>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </div>

        <p className="text-xs text-gray-500">* required field</p>
      </form>
    </div>
  )
}

function stressLabelFor(rate: number): string {
  if (rate <= 500) return 'safe zone'
  if (rate <= 2000) return 'moderate stress'
  if (rate <= 10000) return 'high stress'
  return 'severe stress'
}

function stressDescriptionFor(rate: number): string {
  if (rate <= 500) {
    return `At ${rate} per second the simulated platform is in its comfortable zone. Expect ~0% failures and response time around 60-100 ms.`
  }
  if (rate <= 2000) {
    return `At ${rate} per second the platform starts to feel pressure. Expect up to 5% failures and response time creeping up to ~250 ms. Still usable.`
  }
  if (rate <= 10000) {
    return `At ${rate} per second the platform is heavily stressed. Expect 5% to 30% failures and response time between 250 ms and ~800 ms. Reduce the rate for cleaner results.`
  }
  return `At ${rate} per second the platform is overloaded. Expect ~40% failures and response time over 1 second. Drop the rate below 500 per second for a clean run.`
}

function stressBoxClass(rate: number): string {
  if (rate <= 500) return 'bg-green-50 border-green-200 text-green-900 mt-3'
  if (rate <= 2000) return 'bg-yellow-50 border-yellow-200 text-yellow-900 mt-3'
  if (rate <= 10000) return 'bg-orange-50 border-orange-200 text-orange-900 mt-3'
  return 'bg-red-50 border-red-200 text-red-900 mt-3'
}

export default EditSimulationPage
