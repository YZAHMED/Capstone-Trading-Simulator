import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listSimulations, deleteSimulation, Simulation } from '../api/simulations'
import DeleteModal from '../components/DeleteModal'

function statusBadge(status: string) {
  const colors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700',
    running: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-700',
  }
  const cls = colors[status] || 'bg-gray-100 text-gray-700'
  return <span className={`inline-block px-2 py-0.5 rounded text-xs ${cls}`}>{status}</span>
}

function DashboardPage() {
  const [sims, setSims] = useState<Simulation[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<Simulation | null>(null)

  async function refresh() {
    setLoading(true)
    try {
      const data = await listSimulations()
      setSims(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  async function handleDelete() {
    if (!deleting) return
    await deleteSimulation(deleting.id)
    setDeleting(null)
    refresh()
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My simulations</h1>
        <Link
          to="/simulations/new"
          className="bg-gray-800 text-white px-4 py-2 rounded text-sm hover:bg-gray-900"
        >
          + New
        </Link>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : sims.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-300 rounded p-8 text-center">
          <p className="text-gray-500">You haven't created any simulations yet.</p>
        </div>
      ) : (
        <div className="bg-white shadow rounded overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-600">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Symbol</th>
                <th className="p-3">Status</th>
                <th className="p-3">Created</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sims.map((s) => (
                <tr key={s.id} className="border-t border-gray-100">
                  <td className="p-3 text-gray-800">{s.name}</td>
                  <td className="p-3 text-gray-700">{s.symbol}</td>
                  <td className="p-3">{statusBadge(s.status)}</td>
                  <td className="p-3 text-gray-500">
                    {new Date(s.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-3 text-right space-x-3">
                    {s.status === 'draft' && (
                      <Link
                        to={`/simulations/${s.id}/edit`}
                        className="text-blue-600 hover:underline"
                      >
                        Edit
                      </Link>
                    )}
                    <button
                      onClick={() => setDeleting(s)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {deleting && (
        <DeleteModal
          name={deleting.name}
          onConfirm={handleDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  )
}

export default DashboardPage
