import { useEffect, useState } from 'react'
import { getActivityLog, ActivityLogEntry } from '../api/admin'

function AdminActivityPage() {
  const [rows, setRows] = useState<ActivityLogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getActivityLog()
      .then(setRows)
      .catch(() => setError('Could not load activity log'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Activity Log</h1>

      {error && <p className="text-red-600 mb-3 text-sm">{error}</p>}

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : rows.length === 0 ? (
        <p className="text-gray-500">No activity yet.</p>
      ) : (
        <div className="bg-white shadow rounded overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-600">
              <tr>
                <th className="p-3">When</th>
                <th className="p-3">Who</th>
                <th className="p-3">Action</th>
                <th className="p-3">Target</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-gray-100">
                  <td className="p-3 text-gray-500">
                    {new Date(r.timestamp).toLocaleString()}
                  </td>
                  <td className="p-3 text-gray-800">{r.actor_username}</td>
                  <td className="p-3 text-gray-700">{r.action}</td>
                  <td className="p-3 text-gray-700">{r.target || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default AdminActivityPage
