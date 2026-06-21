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
    <div className="bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-5xl mx-auto px-4 py-16">

        <div className="text-center mb-16">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium mb-4">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2" />
            Capstone project
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
            Trading Simulator
          </h1>
          <p className="mt-5 text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Set up fake batches of trades and see how the platform handles them.
            Pick a symbol, choose how many transactions to send and at what rate,
            run it, and look at the results: success rate, average latency, and a
            chart of latency over time.
          </p>

          {!user && (
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                to="/register"
                className="inline-block bg-gray-900 text-white px-6 py-2.5 rounded-lg shadow-sm hover:bg-gray-800 transition"
              >
                Get started
              </Link>
              <Link
                to="/login"
                className="inline-block border border-gray-300 px-6 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 transition"
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
                className="inline-block mt-3 bg-gray-900 text-white px-6 py-2.5 rounded-lg shadow-sm hover:bg-gray-800 transition"
              >
                Go to {labelFor(user.role)}
              </Link>
            </div>
          )}
        </div>

        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
            What you can do
          </h2>
          <p className="text-gray-500 text-center mb-8 text-sm">
            Three roles, each with their own pages.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm hover:shadow-md transition">
              <div className="w-11 h-11 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 17l6-6 4 4 8-8M14 7h7v7" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">As a Trader</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Create a new simulation, set the number of transactions and the
                rate, and run it. While it runs you see a live progress bar.
                When it finishes you get a results page with summary cards and a
                chart of latency over time. You can overlay one run on another
                to compare them.
              </p>
            </div>

            <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm hover:shadow-md transition">
              <div className="w-11 h-11 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18M7 17V9m4 8V6m4 11v-5m4 5V8" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">As a System Analyst</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Look at how the whole platform is performing. A dashboard with
                charts for average latency by day and runs per day. A history
                page lists every simulation that has been run on the platform.
              </p>
            </div>

            <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm hover:shadow-md transition">
              <div className="w-11 h-11 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">As an Administrator</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Manage user accounts. Change their roles, deactivate or
                reactivate accounts, and read the audit log of every admin
                action.
              </p>
            </div>

          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-6 mb-8 border-l-4 border-l-blue-500 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Why this matters</h2>
          <p className="text-sm text-gray-700 leading-relaxed">
            Testing a real trading platform under load is expensive and risky. A
            simulator lets you push thousands of fake transactions through at
            any rate and see how the system holds up. The results help you spot
            bottlenecks, set realistic capacity targets, and explain
            performance to people who would rather look at a chart than read a
            log file.
          </p>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-5">How it works</h2>
          <ol className="space-y-4">
            {STEPS.map((step, i) => (
              <li key={i} className="flex items-start">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-900 text-white text-xs font-semibold flex items-center justify-center mr-3 mt-0.5">
                  {i + 1}
                </span>
                <p className="text-sm text-gray-700 leading-relaxed">{step}</p>
              </li>
            ))}
          </ol>
        </div>

        <p className="mt-10 text-xs text-gray-400 text-center">
          Backend: <span className={status === 'ok' ? 'text-green-600' : 'text-red-500'}>{status}</span>
        </p>
      </div>
    </div>
  )
}

const STEPS = [
  'Sign up or log in. Three roles are available: Trader, System Analyst, Administrator.',
  'As a Trader, click "My Simulations" then "New" to create a simulation. Give it a name, a symbol, the number of transactions, the rate per second, and how many seconds it should run for.',
  'Click Run. A background worker on the server starts generating fake transactions.',
  'Watch the progress bar fill up in real time. Each transaction gets a random latency.',
  'When the run finishes, the results page shows total transactions, success rate, average latency, p95 latency, and a line chart of latency over time. Pick a second simulation from the dropdown to overlay it on the chart for comparison.',
]

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
