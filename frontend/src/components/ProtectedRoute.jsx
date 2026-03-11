import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "../context/AuthContext.jsx"

const ProtectedRoute = () => {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="card">Checking session...</div>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

export default ProtectedRoute
