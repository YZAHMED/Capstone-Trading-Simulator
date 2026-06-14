import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import NavBar from './components/NavBar'
import RoleRoute from './components/RoleRoute'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import NewSimulationPage from './pages/NewSimulationPage'
import EditSimulationPage from './pages/EditSimulationPage'
import RunPage from './pages/RunPage'
import ResultsPage from './pages/ResultsPage'
import AnalyticsPage from './pages/AnalyticsPage'
import HistoryPage from './pages/HistoryPage'
import AdminUsersPage from './pages/AdminUsersPage'
import AdminActivityPage from './pages/AdminActivityPage'

function NotFound() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12 text-center text-gray-600">
      Page not found.
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50">
          <NavBar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route path="/dashboard" element={<RoleRoute allowed={['trader']}><DashboardPage /></RoleRoute>} />
            <Route path="/simulations/new" element={<RoleRoute allowed={['trader']}><NewSimulationPage /></RoleRoute>} />
            <Route path="/simulations/:id/edit" element={<RoleRoute allowed={['trader']}><EditSimulationPage /></RoleRoute>} />
            <Route path="/simulations/:id/run" element={<RoleRoute allowed={['trader']}><RunPage /></RoleRoute>} />
            <Route path="/simulations/:id/results" element={<RoleRoute allowed={['trader', 'analyst']}><ResultsPage /></RoleRoute>} />

            <Route path="/analytics" element={<RoleRoute allowed={['analyst', 'admin']}><AnalyticsPage /></RoleRoute>} />
            <Route path="/history" element={<RoleRoute allowed={['analyst', 'admin']}><HistoryPage /></RoleRoute>} />

            <Route path="/admin/users" element={<RoleRoute allowed={['admin']}><AdminUsersPage /></RoleRoute>} />
            <Route path="/admin/activity" element={<RoleRoute allowed={['admin']}><AdminActivityPage /></RoleRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
