import { Navigate } from 'react-router-dom';
import { AppUser, UserRole } from '../types';

interface ProtectedRouteProps {
  user: AppUser | null;
  requiredRole?: UserRole;
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  user, 
  requiredRole, 
  children 
}) => {
  // No autenticado
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Requiere rol específico
  if (requiredRole && user.role !== requiredRole) {
    // Redirigir al dashboard correspondiente
    return <Navigate to={user.role === 'teacher' ? '/teacher' : '/student'} replace />;
  }

  return <>{children}</>;
};