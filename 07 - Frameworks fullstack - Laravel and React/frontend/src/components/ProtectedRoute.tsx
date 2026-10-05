import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <div className="max-w-6xl mx-auto px-4 py-16 text-center text-slate-500">Chargement…</div>
  }

  if (!user) {
    return <Navigate to="/connexion" state={{ from: location }} replace />
  }

  return <>{children}</>
}
