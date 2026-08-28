import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

function ProtectedRoute({ children }) {
    const location = useLocation()
    const { isAuthenticated, loading } = useAuth()

    if (loading) {
        return <div className="protected-route-loading">Loading...</div>
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace state={{ from: location.pathname }} />
    }

    return children
}

export default ProtectedRoute
