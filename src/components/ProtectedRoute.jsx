import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { user, token, loading } = useAuth();
    
    if (loading) return null;
    
    if (!token) {
        return <Navigate to="/landing" />;
    }
    
    if (allowedRoles.length && !allowedRoles.includes(user.role)) {
        return <Navigate to="/" />;
    }
    
    return children;
};

export default ProtectedRoute;
