// src/pages/Dashboard.tsx
import { useAuthStore } from '../store/authStore';
import { Navbar } from '../components/layout/Navbar';
import { TeacherDashboard } from '../components/dashboard/TeacherDashboard';
import { ParentDashboard } from '../components/dashboard/ParentDashboard';
import { StudentDashboard } from '../components/dashboard/StudentDashboard';
import { AdminDashboard } from '../components/dashboard/AdminDashboard';
import { Sparkles, Calendar, AlertCircle } from 'lucide-react';

export const Dashboard = () => {
  const { user } = useAuthStore();
  
  const role = user?.rol as 'PROFESOR' | 'PADRE' | 'ALUMNO' | 'ADMIN' | undefined;

  // Función para obtener el color y texto de la etiqueta según el rol
  const getRoleBadge = () => {
    switch (role) {
      case 'ADMIN': 
        return { text: 'Administrador', color: 'bg-slate-800 text-white border-slate-700' };
      case 'PROFESOR': 
        return { text: 'Profesor', color: 'bg-blue-100 text-blue-700 border-blue-200' };
      case 'ALUMNO': 
        return { text: 'Estudiante', color: 'bg-green-100 text-green-700 border-green-200' };
      case 'PADRE': 
        return { text: 'Familiar', color: 'bg-purple-100 text-purple-700 border-purple-200' };
      default: 
        return { text: 'Usuario', color: 'bg-gray-100 text-gray-700 border-gray-200' };
    }
  };

  const renderDashboard = () => {
    switch (role) {
      case 'PROFESOR': return <TeacherDashboard />;
      case 'PADRE': return <ParentDashboard />;
      case 'ALUMNO': return <StudentDashboard />;
      case 'ADMIN': return <AdminDashboard />;
      default: return (
        <div className="bg-red-50 border border-red-200 p-12 rounded-2xl flex flex-col items-center justify-center shadow-sm text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
          <h2 className="text-xl font-bold text-red-700 mb-2">Rol no reconocido</h2>
          <p className="text-red-600">Ha ocurrido un problema al identificar tu tipo de cuenta. Contacta con soporte.</p>
        </div>
      );
    }
  };

  const badge = getRoleBadge();
  
  // Obtenemos la fecha actual formateada en español
  const hoy = new Intl.DateTimeFormat('es-ES', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long' 
  }).format(new Date());

  const u = user as any;
  const nombreCompleto = u?.profesor?.nombreCompleto || 
                         u?.alumno?.nombreCompleto || 
                         u?.padre?.nombreCompleto || 
                         u?.nombreCompleto || 
                         (u?.email ? u.email.split('@')[0] : 'Usuario');

  const primerNombre = nombreCompleto ? nombreCompleto.split(' ')[0] : 'Usuario';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />
      
      {/* ========================================== */}
      {/* CABECERA DE BIENVENIDA                     */}
      {/* ========================================== */}
      <div className="bg-white border-b border-gray-200 pt-10 pb-16 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight flex items-center">
                ¡Hola, {primerNombre}! 
                <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-yellow-400 ml-2 animate-pulse" />
              </h1>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border shadow-sm ${badge.color}`}>
                {badge.text}
              </span>
            </div>
            <p className="text-gray-500 font-medium flex items-center mt-1">
              <Calendar className="w-4 h-4 mr-2" />
              {/* Capitalizamos la primera letra del día */}
              {hoy.charAt(0).toUpperCase() + hoy.slice(1)}
            </p>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* CONTENIDO PRINCIPAL DINÁMICO               */}
      {/* ========================================== */}
      {/* El margen negativo (-mt-8) hace que las tarjetas del dashboard se monten sobre la cabecera blanca */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 -mt-8 relative z-10 animate-in slide-in-from-bottom-4 duration-500">
        {renderDashboard()}
      </main>
    </div>
  );
};