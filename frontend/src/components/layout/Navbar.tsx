import { useAuthStore } from '../../store/authStore';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import logoFull from '../../assets/logofull.jpg';

export const Navbar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 z-40 shadow-sm">
      <Link to="/" className="flex items-center space-x-2">
        <img src={logoFull} alt="EduPlay" className="h-10 w-auto object-contain" />
      </Link>
      
      {user ? (
        <div className="flex items-center space-x-6">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-bold text-gray-800">{user.nombreCompleto || user.email}</p>
            <p className="text-xs text-primary-600 font-semibold tracking-wide capitalize">{user.rol?.toLowerCase()}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
            title="Cerrar Sesión"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <div className="flex items-center space-x-4">
          <Link to="/login" className="text-sm font-bold text-gray-700 hover:text-primary-600 transition-colors">
            Iniciar Sesión
          </Link>
          <Link to="/register" className="text-sm font-bold bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors">
            Registrarse
          </Link>
        </div>
      )}
    </nav>
  );
};
