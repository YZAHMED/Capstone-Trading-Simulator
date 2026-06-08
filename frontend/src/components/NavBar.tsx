import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function NavBar() {
  const { user, logout } = useAuth()

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="font-bold text-gray-800">Trading Simulator</Link>
        <div className="flex items-center space-x-4 text-sm">
          {user ? (
            <>
              <span className="text-gray-600">Hi, {user.username}</span>
              <button onClick={logout} className="text-blue-600 hover:underline">
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-blue-600 hover:underline">Log in</Link>
              <Link to="/register" className="text-blue-600 hover:underline">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default NavBar
