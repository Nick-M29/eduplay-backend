import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { classService } from '../../services/class.service';
import { KeyRound, GraduationCap, Trophy, Edit3, BookOpen, Plus, ArrowRight } from 'lucide-react';
import { ProfileEditor } from './ProfileEditor';

export const StudentDashboard = () => {
  const { user, updateUser } = useAuthStore();

  const [clases, setClases] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [codigoClase, setCodigoClase] = useState('');
  const [claveIngreso, setClaveIngreso] = useState('');
  const [message, setMessage] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const fetchClases = async () => {
    try {
      const res = await classService.getMyClasses();
      setClases(res.data || []);

      if (res.puntos !== undefined && res.puntos !== user?.puntos) {
        updateUser({ puntos: res.puntos });
      }
    } catch (err) {
      console.error("Error cargando clases:", err);
    }
  };

  useEffect(() => {
    fetchClases();
    const intervalId = setInterval(() => {
      fetchClases();
    }, 5000);
    return () => clearInterval(intervalId);
  }, [user?.puntos]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await classService.joinClass(codigoClase, claveIngreso);
      setMessage('¡Te has unido a la clase con éxito!');
      setCodigoClase('');
      setClaveIngreso('');
      fetchClases();
      setTimeout(() => { setIsModalOpen(false); setMessage(''); }, 2000);
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Error al unirse a la clase');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* ========================================== */}
      {/* BANNER DE ESTADÍSTICAS (Gamificado)          */}
      {/* ========================================== */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="max-w-xl">
            <h2 className="text-3xl font-black mb-2 tracking-tight text-white">Tu Panel de Jugador</h2>
            <p className="text-primary-100 text-lg leading-snug">
              Completa las tareas de tus profesores, acumula puntos de experiencia (XP) y demuestra tu nivel en el aula.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 w-full lg:w-auto">
            {/* Tarjeta de Código */}
            <div className="flex-1 lg:flex-none inline-flex items-center bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 shadow-inner">
              <KeyRound className="w-8 h-8 mr-4 text-primary-200" />
              <div>
                <p className="text-[10px] uppercase tracking-widest text-primary-200 font-bold mb-0.5">Código Secreto</p>
                <p className="text-xl font-mono font-black tracking-[0.1em]">{user?.codigoAcceso || '******'}</p>
              </div>
            </div>

            {/* Tarjeta de Puntos (Clickeable) */}
            <div 
              className="flex-1 lg:flex-none inline-flex items-center bg-yellow-400/20 backdrop-blur-md rounded-xl p-4 border border-yellow-300/30 shadow-inner relative group cursor-pointer hover:bg-yellow-400/30 transition-colors" 
              onClick={() => setIsProfileOpen(true)}
              title="Editar Perfil"
            >
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Edit3 className="w-4 h-4 text-yellow-200" />
              </div>
              <Trophy className="w-8 h-8 mr-4 text-yellow-300" />
              <div>
                <p className="text-[10px] uppercase tracking-widest text-yellow-100 font-bold mb-0.5">Experiencia</p>
                <p className="text-2xl font-black text-yellow-300">{user?.puntos || 0} XP</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Marca de agua decorativa */}
        <GraduationCap className="absolute -right-10 -bottom-10 w-64 h-64 text-white opacity-5 transform -rotate-12" />
      </div>

      {/* ========================================== */}
      {/* SECCIÓN: MIS CLASES                        */}
      {/* ========================================== */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-gray-800 tracking-tight">Mis Clases</h2>
        {clases.length > 0 && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center bg-primary-50 text-primary-700 px-4 py-2.5 rounded-xl font-bold hover:bg-primary-100 transition-colors border border-primary-100"
          >
            <Plus className="w-5 h-5 mr-1.5" /> Unirme a otra clase
          </button>
        )}
      </div>

      {/* Renderizado Dinámico de Clases */}
      {clases.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border-2 border-dashed border-gray-200 text-center max-w-2xl mx-auto">
          <div className="w-20 h-20 bg-primary-50 text-primary-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-black text-gray-800 mb-3">¿Tienes una nueva clase?</h3>
          <p className="text-gray-500 text-base mb-8">
            Ingresa el código que te dio tu profesor para unirte a su aula y acceder a los materiales y tareas en tiempo real.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-primary-600 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-primary-700 transition-all shadow-md hover:shadow-lg inline-flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" /> Unirme a mi primera clase
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clases.map((item: any) => {
            const c = item.clase || item;

            return (
              <div 
                key={c.id} 
                className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group flex flex-col"
              >
                {/* Cabecera Colorida */}
                <div className="bg-gradient-to-br from-primary-500 to-blue-600 p-6 relative overflow-hidden">
                  <BookOpen className="absolute -bottom-4 -right-4 w-24 h-24 text-white opacity-10 transform group-hover:scale-110 transition-transform duration-500" />
                  
                  <h3 className="text-2xl font-black text-white relative z-10 mb-1 tracking-tight truncate pr-8">
                    {c.nombreClase || c.nombre || 'Clase sin nombre'}
                  </h3>
                  <p className="text-blue-100 text-sm font-medium relative z-10 flex items-center">
                    <GraduationCap className="w-4 h-4 mr-1.5" />
                    Profesor: {c.profesor?.nombreCompleto || 'Asignado'}
                  </p>
                </div>

                {/* Footer / Botón */}
                <div className="p-6 mt-auto">
                  <a
                    href={`/clases/${c.id}`}
                    className="w-full py-3 bg-blue-50 text-blue-700 font-bold rounded-xl hover:bg-primary-600 hover:text-white transition-colors duration-300 flex justify-center items-center group/btn"
                  >
                    Entrar al Aula
                    <ArrowRight className="w-4 h-4 ml-2 transform group-hover/btn:translate-x-1 transition-transform" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL UNIRSE A CLASE                         */}
      {/* ========================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md animate-in fade-in zoom-in-95 duration-200 shadow-2xl">
            <h3 className="text-2xl font-black mb-6 text-gray-900 flex items-center">
              <KeyRound className="w-6 h-6 mr-2 text-primary-500" />
              Unirse a Clase
            </h3>
            
            {message && (
              <p className={`mb-6 text-sm font-bold text-center p-3 rounded-xl ${message.includes('éxito') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                {message}
              </p>
            )}

            <form onSubmit={handleJoin}>
              <div className="space-y-5 mb-8">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Código de la Clase</label>
                  <input 
                    type="text" 
                    required 
                    value={codigoClase} 
                    onChange={(e) => setCodigoClase(e.target.value)} 
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 bg-gray-50 font-mono font-bold text-gray-800 uppercase" 
                    placeholder="Ej. MATH-101" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Clave de Ingreso</label>
                  <input 
                    type="text" 
                    required 
                    value={claveIngreso} 
                    onChange={(e) => setClaveIngreso(e.target.value)} 
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 bg-gray-50 font-mono font-bold text-gray-800 uppercase" 
                    placeholder="Clave secreta" 
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button 
                  type="button" 
                  onClick={() => { setIsModalOpen(false); setMessage(''); }} 
                  className="px-6 py-2.5 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2.5 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 shadow-md transition-all flex items-center"
                >
                  <Plus className="w-4 h-4 mr-1.5" /> Unirme
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Editor de Perfil Modal */}
      {isProfileOpen && <ProfileEditor onClose={() => setIsProfileOpen(false)} />}
    </div>
  );
};