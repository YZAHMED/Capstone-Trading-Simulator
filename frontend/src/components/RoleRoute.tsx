import { Navigate } from 'react-router-dom'
import { ReactNode } from 'react'
import { useAuth } from '../context/AuthContext'

interface Props {
  children: ReactNode
  allowed: string[]
}

function RoleRoute({ children, allowed }: Props) {
  const { user, token } = useAuth()

  if (!token) return <Navigate to="/login" replace />
  if (!user) return null
  if (!allowed.includes(user.role)) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 text-center">
        <p className="text-red-600">You are not allowed to view this page.</p>
      </div>
    )
  }

  return <>{children}</>
}

export default RoleRoute
