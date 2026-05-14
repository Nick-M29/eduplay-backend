import React, { useState, useEffect } from 'react';
import { obtenerComentarios, crearComentario } from '../services/materiales.service'; // Ajusta tu ruta

interface Comentario {
  id: number;
  texto: string;
  autor: string;
  esMio: boolean;
  fechaCreacion: string;
  rolAutorOriginal?: string;
  parentId?: number | null; // NUEVO
}

interface Props {
  materialId: number;
}

const ComentariosMaterial: React.FC<Props> = ({ materialId }) => {
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [nuevoTexto, setNuevoTexto] = useState('');
  const [cargando, setCargando] = useState(true);
  
  // NUEVO: Estado para saber a qué comentario le estamos dando a "Responder"
  const [respondiendoA, setRespondiendoA] = useState<number | null>(null);

  const cargarComentarios = async () => {
    try {
      const data = await obtenerComentarios(materialId);
      setComentarios(data);
    } catch (error) {
      console.error('Error al cargar comentarios', error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarComentarios();
  }, [materialId]);

  const handleSubmit = async (e: React.FormEvent, parentId?: number) => {
    e.preventDefault();
    if (!nuevoTexto.trim()) return;

    try {
      await crearComentario(materialId, nuevoTexto, parentId);
      setNuevoTexto('');
      setRespondiendoA(null); // Cerramos el cuadro de respuesta si estaba abierto
      cargarComentarios();
    } catch (error) {
      console.error('Error al enviar comentario', error);
    }
  };

  if (cargando) return <p className="text-gray-500 text-sm mt-4">Cargando comentarios...</p>;

  // Separamos los comentarios principales (los que no tienen padre)
  const comentariosPrincipales = comentarios.filter(c => !c.parentId);

  return (
    <div className="mt-6 border-t border-gray-100 pt-6">
      <h3 className="font-semibold text-gray-800 mb-4">Comentarios</h3>
      
      <div className="space-y-4 mb-6">
        {comentariosPrincipales.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No hay comentarios aún. ¡Sé el primero!</p>
        ) : (
          comentariosPrincipales.map((c) => (
            <div key={c.id} className="space-y-3">
              {/* COMENTARIO PRINCIPAL */}
              <div className={`p-4 rounded-xl text-sm ${c.esMio ? 'bg-blue-50/50 border border-blue-100' : 'bg-gray-50 border border-gray-100'}`}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className={`font-bold ${c.esMio ? 'text-blue-700' : 'text-gray-700'}`}>
                    {c.autor}
                    {c.rolAutorOriginal === 'PROFESOR' && <span className="ml-2 text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full uppercase tracking-wider font-bold">Profe</span>}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(c.fechaCreacion).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-700">{c.texto}</p>
                <div className="mt-2 text-right">
                  <button 
                    onClick={() => setRespondiendoA(respondiendoA === c.id ? null : c.id)}
                    className="text-xs font-semibold text-gray-500 hover:text-primary-600 transition"
                  >
                    {respondiendoA === c.id ? 'Cancelar' : 'Responder'}
                  </button>
                </div>
              </div>

              {/* RESPUESTAS A ESTE COMENTARIO (CASCADA) */}
              <div className="ml-8 space-y-3 pl-4 border-l-2 border-gray-100">
                {comentarios
                  .filter((resp) => resp.parentId === c.id)
                  .map((resp) => (
                    <div key={resp.id} className={`p-3 rounded-lg text-sm ${resp.esMio ? 'bg-blue-50/50' : 'bg-gray-50'}`}>
                      <div className="flex justify-between items-center mb-1">
                        <span className={`font-bold ${resp.esMio ? 'text-blue-700' : 'text-gray-700'}`}>
                          {resp.autor}
                          {resp.rolAutorOriginal === 'PROFESOR' && <span className="ml-2 text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full uppercase tracking-wider font-bold">Profe</span>}
                        </span>
                      </div>
                      <p className="text-gray-600">{resp.texto}</p>
                    </div>
                  ))}

                {/* INPUT PARA RESPONDER ESPECÍFICAMENTE A ESTE COMENTARIO */}
                {respondiendoA === c.id && (
                  <form onSubmit={(e) => handleSubmit(e, c.id)} className="flex gap-2 mt-2">
                    <input
                      type="text"
                      autoFocus
                      value={nuevoTexto}
                      onChange={(e) => setNuevoTexto(e.target.value)}
                      placeholder={`Respondiendo a ${c.autor}...`}
                      className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                    />
                    <button type="submit" disabled={!nuevoTexto.trim()} className="bg-primary-500 text-white px-3 py-1.5 rounded-lg text-sm font-semibold disabled:opacity-50">
                      Enviar
                    </button>
                  </form>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* INPUT PRINCIPAL PARA NUEVAS DUDAS (Sin padre) */}
      {!respondiendoA && (
        <form onSubmit={(e) => handleSubmit(e)} className="flex gap-2">
          <input
            type="text"
            value={nuevoTexto}
            onChange={(e) => setNuevoTexto(e.target.value)}
            placeholder="Escribe una nueva duda o comentario general..."
            className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button type="submit" disabled={!nuevoTexto.trim()} className="bg-blue-500 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-600 transition disabled:opacity-50">
            Enviar
          </button>
        </form>
      )}
    </div>
  );
};

export default ComentariosMaterial;