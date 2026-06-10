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

  if (loading) {
    return <div className="max-w-2xl mx-auto px-4 py-8 text-gray-500">Loading...</div>
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Edit simulation</h1>

      <form onSubmit={handleSubmit} className="bg-white shadow rounded p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-1 w-full border border-gray-300 rounded px-3 py-2"
          />
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
        </div>

        <div className="grid grid-cols-3 gap-4">
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
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Rate / second *</label>
            <input
              type="number"
              value={ratePerSecond}
              onChange={(e) => setRatePerSecond(e.target.value)}
              required
              min={1}
              className="mt-1 w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Duration (s) *</label>
            <input
              type="number"
              value={durationSeconds}
              onChange={(e) => setDurationSeconds(e.target.value)}
              required
              min={1}
              className="mt-1 w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
        </div>

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

export default EditSimulationPage
