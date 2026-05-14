import { useState, useEffect } from 'react';
import { classService } from '../../services/class.service';
import { Copy, ArrowRight, BookOpen, Plus, Check, Users, PlusCircle } from 'lucide-react';

export const TeacherDashboard = () => {
  const [clases, setClases] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nombreClase, setNombreClase] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchClases = async () => {
    try {
      const res = await classService.getMyClasses();
      setClases(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchClases();
  }, []);
  console.log("CLASES RECIBIDAS DEL BACKEND:", clases);
  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await classService.createClass(nombreClase);
      setNombreClase('');
      setIsModalOpen(false);
      fetchClases();
    } catch (err) {
      console.error(err);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* ========================================== */}
      {/* SECCIÓN: MIS CLASES                        */}
      {/* ========================================== */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-black text-gray-800 tracking-tight">Mis Clases</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center bg-primary-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-primary-700 shadow-sm transition-all"
        >
          <PlusCircle className="w-5 h-5 mr-2" /> Crear Nueva Clase
        </button>
      </div>

      {clases.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border-2 border-dashed border-gray-200">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-700 mb-2">Sin clases activas</h3>
          <p className="text-gray-500">Aún no has creado ninguna clase. ¡Empieza creando tu primera aula virtual!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clases.map((c) => (
            <div 
              key={c.id} 
              className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group flex flex-col"
            >
              {/* Cabecera Colorida de la Tarjeta */}
              <div className="bg-gradient-to-br from-primary-500 to-blue-600 p-6 relative overflow-hidden">
                {/* Icono de fondo decorativo */}
                <BookOpen className="absolute -bottom-4 -right-4 w-24 h-24 text-white opacity-10 transform group-hover:scale-110 transition-transform duration-500" />
                
                <h3 className="text-2xl font-black text-white relative z-10 mb-1 tracking-tight truncate pr-8">
                  {c.nombreClase || 'Clase sin nombre'} 
                </h3>
                
                <div className="flex items-center text-blue-100 text-sm font-medium relative z-10">
                  <Users className="w-4 h-4 mr-1.5" />
                  <span>{c.alumnos?.length || 0} Alumnos inscritos</span>
                </div>
              </div>

              {/* Cuerpo de la Tarjeta (Códigos) */}
              <div className="p-6 space-y-4 flex-1">
                
                {/* Código de Clase */}
                <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-100 flex justify-between items-center group-hover:border-primary-100 transition-colors">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Código de Clase</p>
                    <p className="font-mono font-bold text-gray-800 text-sm">{c.codigoClase || c.codigo}</p>
                  </div>
                  <button 
                    onClick={() => copyToClipboard(c.codigoClase || c.codigo, `codigo-${c.id}`)}
                    className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    title="Copiar código"
                  >
                    {copiedId === `codigo-${c.id}` ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                {/* Clave de Ingreso */}
                <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-100 flex justify-between items-center group-hover:border-primary-100 transition-colors">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Clave de Ingreso</p>
                    <p className="font-mono font-bold text-gray-800 text-sm">{c.claveIngreso}</p>
                  </div>
                  <button 
                    onClick={() => copyToClipboard(c.claveIngreso, `clave-${c.id}`)}
                    className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    title="Copiar clave"
                  >
                    {copiedId === `clave-${c.id}` ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

              </div>

              {/* Footer con el Botón de Entrar */}
              <div className="px-6 pb-6 mt-auto">
                <a 
                  href={`/clases/${c.id}`}
                  className="w-full py-3 bg-blue-50 text-blue-700 font-bold rounded-xl hover:bg-primary-600 hover:text-white transition-colors duration-300 flex justify-center items-center group/btn"
                >
                  Entrar al Aula 
                  <ArrowRight className="w-4 h-4 ml-2 transform group-hover/btn:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL CREAR CLASE                            */}
      {/* ========================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md animate-in fade-in zoom-in-95 duration-200 shadow-2xl">
            <h3 className="text-2xl font-black text-gray-800 mb-6 flex items-center">
              <BookOpen className="w-6 h-6 mr-2 text-primary-500" />
              Crear Nueva Clase
            </h3>
            <form onSubmit={handleCreateClass}>
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                  Nombre de la Clase
                </label>
                <input
                  type="text"
                  required
                  value={nombreClase}
                  onChange={(e) => setNombreClase(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 transition-all font-medium"
                  placeholder="Ej. Matemáticas Básicas"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="px-5 py-2.5 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2.5 bg-primary-600 font-bold text-white rounded-xl hover:bg-primary-700 shadow-md transition-all flex items-center"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Crear Clase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};