// src/components/dashboard/TeacherDashboard.tsx
import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Users, Shield, BookOpen, Loader2 } from 'lucide-react';

interface Clase {
  id: number;
  nombreClase: string;
  codigoClase: string;
  _count: {
    alumnos: number;
  };
}

export const TeacherDashboard = () => {
  const [clases, setClases] = useState<Clase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClases = async () => {
      try {
        const response = await api.get('/profesor/mis-clases');
        setClases(response.data.data);
      } catch (error) {
        console.error("Error cargando clases:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClases();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 bg-white rounded-3xl shadow-sm border border-slate-200">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
          <Shield className="w-8 h-8 text-yellow-500" /> 
          Tus Gremios (Clases)
        </h2>
        <button className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-xl shadow-[4px_4px_0px_0px_rgba(30,58,138,1)] active:shadow-none active:translate-y-1 active:translate-x-1 transition-all border-2 border-blue-800">
          + Nuevo Gremio
        </button>
      </div>
      
      {clases.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border-4 border-slate-200 text-center shadow-sm">
          <div className="text-6xl mb-4">🏰</div>
          <h3 className="text-xl font-black text-slate-800 mb-2">Aún no lideras ningún Gremio</h3>
          <p className="text-slate-500 font-bold max-w-md mx-auto">
            Crea tu primera clase para invitar a los aprendices y empezar a enviarles misiones.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clases.map((clase) => (
            <div key={clase.id} className="bg-white rounded-3xl p-6 border-4 border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] hover:-translate-y-2 transition-transform cursor-pointer group">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-blue-100 text-blue-700 font-black px-3 py-1 rounded-lg border-2 border-blue-300 text-sm">
                  {clase.codigoClase}
                </div>
                <BookOpen className="text-slate-400 group-hover:text-blue-500 transition-colors" />
              </div>
              
              <h3 className="text-2xl font-black text-slate-900 mb-2 leading-tight">
                {clase.nombreClase}
              </h3>
              
              <div className="flex items-center justify-between mt-6 pt-4 border-t-2 border-slate-100">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-slate-500" />
                  <span className="text-slate-600 font-bold">
                    {clase._count?.alumnos || 0} Aprendices
                  </span>
                </div>
                <button className="text-blue-600 font-bold hover:text-blue-800 underline decoration-2 underline-offset-2">
                  Entrar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};