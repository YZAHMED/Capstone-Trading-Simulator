import { useEffect, useState } from 'react'
import {
  listAllUsers, changeUserRole, deactivateUser, reactivateUser,
} from '../api/admin'
import { User } from '../api/auth'

function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function refresh() {
    setLoading(true)
    try {
      setUsers(await listAllUsers())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  async function handleRoleChange(u: User, role: string) {
    setMessage('')
    setError('')
    try {
      await changeUserRole(u.id, role)
      setMessage(`Role updated for ${u.username}.`)
      refresh()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Could not update role')
    }
  }

  async function handleToggle(u: User) {
    setMessage('')
    setError('')
    try {
      if (u.is_active) {
        const ok = window.confirm(`Are you sure you want to deactivate ${u.username}?`)
        if (!ok) return
        await deactivateUser(u.id)
        setMessage(`${u.username} has been deactivated.`)
      } else {
        await reactivateUser(u.id)
        setMessage(`${u.username} has been reactivated.`)
      }
      refresh()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Could not update user')
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Users</h1>

      {message && <p className="text-green-700 mb-3 text-sm">{message}</p>}
      {error && <p className="text-red-600 mb-3 text-sm">{error}</p>}

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <div className="bg-white shadow rounded overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-600">
              <tr>
                <th className="p-3">Username</th>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-gray-100">
                  <td className="p-3 text-gray-800">{u.username}</td>
                  <td className="p-3 text-gray-700">{u.email}</td>
                  <td className="p-3">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u, e.target.value)}
                      className="border border-gray-300 rounded px-2 py-1 text-sm"
                    >
                      <option value="trader">trader</option>
                      <option value="analyst">analyst</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td className="p-3">
                    {u.is_active ? (
                      <span className="text-green-700">active</span>
                    ) : (
                      <span className="text-gray-500">inactive</span>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleToggle(u)}
                      className={
                        u.is_active
                          ? 'text-red-600 hover:underline'
                          : 'text-green-700 hover:underline'
                      }
                    >
                      {u.is_active ? 'Deactivate' : 'Reactivate'}
                    </button>
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

export default AdminUsersPage
