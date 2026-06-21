import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../api/client'

function HomePage() {
  const { user } = useAuth()
  const [status, setStatus] = useState<string>('checking...')

  useEffect(() => {
    api.get('/health')
      .then((res) => setStatus(res.data.status))
      .catch(() => setStatus('cannot reach backend'))
  }, [])

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">

      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
          Trading Simulator
        </h1>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
          Set up fake batches of trades and see how the platform handles them.
          Pick a symbol, choose how many transactions to send and at what rate,
          run it, and look at the results: success rate, average latency, and a
          chart of latency over time.
        </p>

        {!user && (
          <div className="mt-8 space-x-3">
            <Link
              to="/register"
              className="inline-block bg-gray-800 text-white px-6 py-2 rounded hover:bg-gray-900"
            >
              Get started
            </Link>
            <Link
              to="/login"
              className="inline-block border border-gray-300 px-6 py-2 rounded text-gray-700 hover:bg-gray-50"
            >
              Log in
            </Link>
          </div>
        )}

        {user && (
          <div className="mt-8">
            <p className="text-gray-700">Welcome back, {user.username}.</p>
            <Link
              to={homePathFor(user.role)}
              className="inline-block mt-3 bg-gray-800 text-white px-6 py-2 rounded hover:bg-gray-900"
            >
              Go to {labelFor(user.role)}
            </Link>
          </div>
        )}
      </div>

      <div className="mb-12">
        <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">
          What you can do
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white shadow rounded p-5">
            <h3 className="font-semibold text-gray-800 mb-2">As a Trader</h3>
            <p className="text-sm text-gray-600">
              Create a new simulation, set the number of transactions and the
              rate, and run it. While it runs you see a live progress bar. When
              it finishes you get a results page with summary cards and a chart
              of latency over time. You can also overlay one run on another to
              compare them.
            </p>
          </div>
          <div className="bg-white shadow rounded p-5">
            <h3 className="font-semibold text-gray-800 mb-2">As a System Analyst</h3>
            <p className="text-sm text-gray-600">
              Look at how the whole platform is performing. A dashboard with
              charts for average latency by day and runs per day. A history page
              lists every simulation that has been run on the platform.
            </p>
          </div>
          <div className="bg-white shadow rounded p-5">
            <h3 className="font-semibold text-gray-800 mb-2">As an Administrator</h3>
            <p className="text-sm text-gray-600">
              Manage user accounts. Change their roles, deactivate or reactivate
              accounts, and read the audit log of every admin action.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-3">Why this matters</h2>
        <p className="text-sm text-gray-700 leading-relaxed">
          Testing a real trading platform under load is expensive and risky. A
          simulator lets you push thousands of fake transactions through at any
          rate and see how the system holds up. The results help you spot
          bottlenecks, set realistic capacity targets, and explain performance
          to people who would rather look at a chart than read a log file.
        </p>
      </div>

      <div className="bg-white shadow rounded p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-3">How it works</h2>
        <ol className="text-sm text-gray-700 list-decimal list-inside space-y-2">
          <li>Sign up or log in. Three roles are available: Trader, System Analyst, Administrator.</li>
          <li>As a Trader, click "My Simulations" then "New" to create a simulation. Give it a name, a symbol, the number of transactions, the rate per second, and how many seconds it should run for.</li>
          <li>Click Run. A background worker on the server starts generating fake transactions.</li>
          <li>Watch the progress bar fill up in real time. Each transaction gets a random latency.</li>
          <li>When the run finishes, the results page shows you total transactions, success rate, average latency, p95 latency, and a line chart of latency over time. You can pick a second simulation from the dropdown to overlay it on the chart for comparison.</li>
        </ol>
      </div>

      <p className="mt-10 text-xs text-gray-400 text-center">
        Backend: {status}
      </p>
    </div>
  )
}

function homePathFor(role: string): string {
  if (role === 'admin') return '/admin/users'
  if (role === 'analyst') return '/analytics'
  return '/dashboard'
}

function labelFor(role: string): string {
  if (role === 'admin') return 'Manage Users'
  if (role === 'analyst') return 'Analytics'
  return 'My Simulations'
}

export default HomePage
