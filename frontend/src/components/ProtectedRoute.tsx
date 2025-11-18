import { Navigate, useLocation } from 'react-router-dom';
import { AppUser, UserRole } from '../types';
import { auth } from '../config/firebase';

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
  const location = useLocation();

  // No autenticado
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Verificar si el email está verificado (solo para usuarios con email/password)
  // Los usuarios de OAuth (Google/Microsoft) ya vienen verificados
  const currentUser = auth.currentUser;
  const isPasswordProvider = currentUser?.providerData[0]?.providerId === 'password';
  const isEmailNotVerified = currentUser && !currentUser.emailVerified && isPasswordProvider;
  
  // Solo redirigir si no estamos ya en /login para evitar bucles
  if (isEmailNotVerified && location.pathname !== '/login') {
    return <Navigate to="/login?verify=true" replace />;
  }

  // Requiere rol específico
  if (requiredRole && user.role !== requiredRole) {
    // Redirigir al dashboard correspondiente
    return <Navigate to={user.role === 'teacher' ? '/teacher' : '/student'} replace />;
  }

  return <>{children}</>;
};