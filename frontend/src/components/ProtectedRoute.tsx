import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore, type RolUsuario } from '../store/authStore';

interface ProtectedRouteProps {
  allowedRoles?: RolUsuario[];
}

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuthStore();

  // Si no está autenticado, redirige al login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Si hay roles permitidos y el usuario no los cumple, redirige al dashboard base
  if (allowedRoles && !allowedRoles.includes(user.rol)) {
    return <Navigate to="/dashboard" replace />;
  }

  // Renderiza los componentes hijos protegidos
  return <Outlet />;
};
