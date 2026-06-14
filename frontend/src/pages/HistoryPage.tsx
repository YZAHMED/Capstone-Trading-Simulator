import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getHistory, HistoryItem } from '../api/analytics'

function HistoryPage() {
  const [rows, setRows] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getHistory()
      .then(setRows)
      .catch(() => setError('Could not load history'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Historical simulations</h1>

      {error && <p className="text-red-600 mb-3 text-sm">{error}</p>}

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : rows.length === 0 ? (
        <p className="text-gray-500">No simulations have been run yet.</p>
      ) : (
        <div className="bg-white shadow rounded overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-600">
              <tr>
                <th className="p-3">User</th>
                <th className="p-3">Name</th>
                <th className="p-3">Symbol</th>
                <th className="p-3">Status</th>
                <th className="p-3">Started</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => (
                <tr key={s.id} className="border-t border-gray-100">
                  <td className="p-3 text-gray-700">{s.username}</td>
                  <td className="p-3 text-gray-800">{s.name}</td>
                  <td className="p-3 text-gray-700">{s.symbol}</td>
                  <td className="p-3 text-gray-700">{s.status}</td>
                  <td className="p-3 text-gray-500">
                    {s.started_at ? new Date(s.started_at).toLocaleString() : '-'}
                  </td>
                  <td className="p-3 text-right">
                    {(s.status === 'completed' || s.status === 'failed') ? (
                      <Link
                        to={`/simulations/${s.id}/results`}
                        className="text-blue-600 hover:underline"
                      >
                        View
                      </Link>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default HistoryPage
