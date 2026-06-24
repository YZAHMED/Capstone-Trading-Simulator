import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createSimulation } from '../api/simulations'

function NewSimulationPage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [symbol, setSymbol] = useState('')
  const [numTransactions, setNumTransactions] = useState('100')
  const [ratePerSecond, setRatePerSecond] = useState('10')
  const [durationSeconds, setDurationSeconds] = useState('10')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      await createSimulation({
        name,
        symbol,
        num_transactions: Number(numTransactions),
        rate_per_second: Number(ratePerSecond),
        duration_seconds: Number(durationSeconds),
      })
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Could not save the simulation')
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

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">New simulation</h1>
      <p className="text-sm text-gray-600 mb-6 leading-relaxed">
        A simulation sends a batch of fake trades at a controlled rate so we can
        see how the platform handles the load. Fill in the four numbers below.
        The simulation runs in the background and stops as soon as either all
        the requested trades have been sent OR the duration limit is reached,
        whichever comes first.
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
            placeholder="AAPL"
            className="mt-1 w-32 border border-gray-300 rounded px-3 py-2"
          />
          <p className="text-xs text-gray-500 mt-1">The stock symbol the fake trades will be tagged with, for example AAPL or TSLA. Used only as a label.</p>
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
            <p className="text-xs text-gray-500 mt-1">How fast to send them (how many trades per second).</p>
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
            <p className="text-xs text-gray-500 mt-1">Max time (in seconds) the simulation can run before it stops.</p>
          </div>
        </div>

        {valid && (
          <div className={`rounded p-4 text-sm border ${willFit ? 'bg-green-50 border-green-200 text-green-900' : 'bg-amber-50 border-amber-200 text-amber-900'}`}>
            <p className="font-semibold mb-1">
              {willFit ? 'Preview: this configuration fits' : 'Preview: this will hit the duration limit'}
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
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>

        <p className="text-xs text-gray-500">* required field</p>
      </form>
    </div>
  )
}

export default NewSimulationPage
