import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { alumnoService } from '../../services/alumno.service';
import { Camera, Palette, Save, Loader2, Lock } from 'lucide-react';

// 🌟 DEFINICIÓN DE RECOMPENSAS
const COLORES = [
  { hex: '#3b82f6', reqXp: 0, name: 'Azul Novato' },
  { hex: '#ef4444', reqXp: 0, name: 'Rojo Básico' },
  { hex: '#10b981', reqXp: 50, name: 'Esmeralda' },
  { hex: '#f59e0b', reqXp: 50, name: 'Ámbar' },
  { hex: '#8b5cf6', reqXp: 100, name: 'Púrpura Real' },
  { hex: '#fbbf24', reqXp: 200, name: 'Dorado Épico' }, // Color legendario
];

const PERSONAJES = [
  { type: 'ROBOT', reqXp: 0, label: '🤖 Robot' },
  { type: 'ZORRO', reqXp: 50, label: '🦊 Zorro' },
  { type: 'NINJA', reqXp: 100, label: '🥷 Ninja' },
  { type: 'DRAGON', reqXp: 200, label: '🐉 Dragón' }, // Nuevo personaje legendario
];

export const ProfileEditor = ({ onClose }: { onClose: () => void }) => {
  const { user, updateUser } = useAuthStore();
  const [tab, setTab] = useState<'FOTO' | 'AVATAR'>('AVATAR');
  const [loading, setLoading] = useState(false);

  // Puntos actuales del alumno (para calcular qué puede usar)
  const currentXp = user?.puntos || 0;

  // Estados
  const [avatar, setAvatar] = useState(user?.avatarJson?.iconType ? user.avatarJson : { bgColor: '#3b82f6', iconColor: '#ffffff', iconType: 'ROBOT' });
  const [photoBase64, setPhotoBase64] = useState<string | null>(user?.avatarJson?.photo || null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validación extra en frontend para evitar archivos monstruosos
      if (file.size > 5 * 1024 * 1024) {
        alert("La imagen es muy grande. Máximo 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const payload = tab === 'FOTO' ? { photo: photoBase64 } : avatar;
      await alumnoService.updatePerfil(user!.id, payload);
      updateUser({ avatarJson: payload });
      onClose();
    } catch (error) {
      console.error(error);
      alert('Error al guardar el perfil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">

        {/* Header Tabs */}
        <div className="flex border-b border-gray-200 bg-gray-50">
          <button
            className={`flex-1 py-4 font-bold text-sm transition-colors ${tab === 'AVATAR' ? 'bg-white text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setTab('AVATAR')}
          >
            <Palette className="w-4 h-4 inline mr-2 mb-0.5" /> Avatar XP
          </button>
          <button
            className={`flex-1 py-4 font-bold text-sm transition-colors ${tab === 'FOTO' ? 'bg-white text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setTab('FOTO')}
          >
            <Camera className="w-4 h-4 inline mr-2 mb-0.5" /> Subir Foto
          </button>
        </div>

        {/* Content */}
        <div className="p-6">

          {/* 🌟 INDICADOR DE XP */}
          <div className="mb-4 text-center">
            <span className="bg-yellow-100 text-yellow-800 font-black px-4 py-1.5 rounded-full text-sm shadow-sm inline-flex items-center border border-yellow-200">
              🏆 Tienes {currentXp} XP
            </span>
          </div>

          {tab === 'AVATAR' ? (
            <div className="space-y-6">
              {/* Preview */}
              <div className="flex justify-center mb-6">
                <div
                  className="w-32 h-32 rounded-full flex items-center justify-center shadow-inner transition-colors duration-300 border-4 border-white ring-4 ring-gray-100"
                  style={{ backgroundColor: avatar.bgColor, color: avatar.iconColor }}
                >
                  <span className="text-5xl font-black">
                    {avatar.iconType === 'ROBOT' ? '🤖' : avatar.iconType === 'ZORRO' ? '🦊' : avatar.iconType === 'DRAGON' ? '🐉' : '🥷'}
                  </span>
                </div>
              </div>

              {/* Controls */}
              <div className="space-y-5">

                {/* Selector de Colores */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Fondos Desbloqueables</label>
                  <div className="grid grid-cols-6 gap-2">
                    {COLORES.map(color => {
                      const isLocked = currentXp < color.reqXp;
                      return (
                        <button
                          key={color.hex}
                          disabled={isLocked}
                          onClick={() => setAvatar({ ...avatar, bgColor: color.hex })}
                          title={isLocked ? `Requiere ${color.reqXp} XP` : color.name}
                          className={`w-10 h-10 rounded-full border-2 flex items-center justify-center relative transition-all
                            ${avatar.bgColor === color.hex ? 'border-gray-900 scale-110 shadow-md' : 'border-transparent hover:scale-105'}
                            ${isLocked ? 'opacity-40 cursor-not-allowed grayscale' : ''}
                          `}
                          style={{ backgroundColor: color.hex }}
                        >
                          {isLocked && <Lock className="w-4 h-4 text-white drop-shadow-md absolute" />}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Selector de Personajes */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Personajes</label>
                  <div className="grid grid-cols-2 gap-3">
                    {PERSONAJES.map(pj => {
                      const isLocked = currentXp < pj.reqXp;
                      return (
                        <button
                          key={pj.type}
                          disabled={isLocked}
                          onClick={() => setAvatar({ ...avatar, iconType: pj.type })}
                          className={`py-3 rounded-xl font-bold text-sm border-2 flex items-center justify-center transition-all
                            ${avatar.iconType === pj.type ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-sm' : 'border-gray-200 text-gray-600'}
                            ${isLocked ? 'bg-gray-100 opacity-60 cursor-not-allowed border-gray-100' : 'hover:border-primary-300'}
                          `}
                        >
                          {isLocked ? (
                            <> <Lock className="w-4 h-4 mr-2 text-gray-400" /> {pj.reqXp} XP </>
                          ) : (
                            pj.label
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>

              </div>
            </div>
          ) : (
            // Pestaña de Foto (sin cambios visuales mayores)
            <div className="space-y-6 flex flex-col items-center">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white ring-4 ring-gray-100 shadow-sm bg-gray-100 flex items-center justify-center">
                {photoBase64 ? (
                  <img src={photoBase64} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="w-10 h-10 text-gray-300" />
                )}
              </div>
              <label className="cursor-pointer bg-primary-50 text-primary-700 font-bold px-4 py-2 rounded-lg hover:bg-primary-100 transition w-full text-center border border-primary-200 shadow-sm">
                Seleccionar Archivo
                <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
              </label>
              <p className="text-xs text-gray-500 text-center">Solo se permiten imágenes menores a 5MB.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-200 rounded-lg transition">Cancelar</button>
          <button onClick={handleSave} disabled={loading} className="px-4 py-2 bg-primary-600 text-white font-bold rounded-lg hover:bg-primary-700 shadow-md transition flex items-center">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            Guardar Perfil
          </button>
        </div>
      </div>
    </div>
  );
};