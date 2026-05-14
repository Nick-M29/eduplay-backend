import { useState } from 'react';
import { classService } from '../../services/class.service';
import { UserPlus, BookOpen } from 'lucide-react';

export const ParentDashboard = () => {
  const [activeModal, setActiveModal] = useState<'VINCULAR' | 'MATRICULAR' | null>(null);
  const [codigoAcceso, setCodigoAcceso] = useState('');
  const [codigoClase, setCodigoClase] = useState('');
  const [claveIngreso, setClaveIngreso] = useState('');
  const [alumnoId, setAlumnoId] = useState('');
  const [message, setMessage] = useState('');

  const handleVincular = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await classService.linkStudent(codigoAcceso);
      setMessage('¡Hijo vinculado con éxito!');
      setCodigoAcceso('');
      setTimeout(() => { setActiveModal(null); setMessage(''); }, 2000);
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Error al vincular');
    }
  };

  const handleMatricular = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await classService.joinClass(codigoClase, claveIngreso, Number(alumnoId));
      setMessage('¡Inscripción exitosa!');
      setCodigoClase(''); setClaveIngreso(''); setAlumnoId('');
      setTimeout(() => { setActiveModal(null); setMessage(''); }, 2000);
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Error al inscribir');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Panel de Padres</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition text-center flex flex-col h-full">
          <UserPlus className="w-12 h-12 text-primary-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold mb-2">Vincular a mi hijo</h3>
          <p className="text-sm text-gray-500 mb-6 flex-grow">Usa el código de acceso secreto de tu hijo para conectarlo a tu cuenta y poder matricularlo en clases.</p>
          <button onClick={() => setActiveModal('VINCULAR')} className="w-full bg-primary-50 text-primary-700 py-2.5 rounded-lg font-bold hover:bg-primary-100 transition">
            Vincular Alumno
          </button>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition text-center flex flex-col h-full">
          <BookOpen className="w-12 h-12 text-secondary-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold mb-2">Matricular hijo en clase</h3>
          <p className="text-sm text-gray-500 mb-6 flex-grow">Inscribe a tu hijo en una nueva clase usando el código y clave del profesor.</p>
          <button onClick={() => setActiveModal('MATRICULAR')} className="w-full bg-secondary-50 text-secondary-700 py-2.5 rounded-lg font-bold hover:bg-secondary-100 transition">
            Matricular
          </button>
        </div>
      </div>

      {/* Modales */}
      {activeModal === 'VINCULAR' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold mb-4">Vincular Hijo</h3>
            {message && <p className="mb-4 text-sm font-medium text-center bg-gray-100 p-2 rounded text-primary-700">{message}</p>}
            <form onSubmit={handleVincular}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Código de Acceso del Alumno</label>
                <input
                  type="text"
                  required
                  value={codigoAcceso}
                  onChange={(e) => setCodigoAcceso(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 font-mono tracking-wider"
                  placeholder="Ej. A1B2C3"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button type="button" onClick={() => {setActiveModal(null); setMessage('');}} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition">Vincular</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeModal === 'MATRICULAR' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold mb-4">Matricular en Clase</h3>
            {message && <p className="mb-4 text-sm font-medium text-center bg-gray-100 p-2 rounded text-secondary-700">{message}</p>}
            <form onSubmit={handleMatricular}>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ID del Alumno (Hijo)</label>
                  <input type="number" required value={alumnoId} onChange={(e) => setAlumnoId(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-secondary-500" placeholder="ID numérico de tu hijo" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Código de la Clase</label>
                  <input type="text" required value={codigoClase} onChange={(e) => setCodigoClase(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-secondary-500" placeholder="Ej. CLASS-123" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Clave de Ingreso</label>
                  <input type="text" required value={claveIngreso} onChange={(e) => setClaveIngreso(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-secondary-500" placeholder="Clave secreta del profesor" />
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button type="button" onClick={() => {setActiveModal(null); setMessage('');}} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-secondary-600 text-white font-medium rounded-lg hover:bg-secondary-700 transition">Inscribir Hijo</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
