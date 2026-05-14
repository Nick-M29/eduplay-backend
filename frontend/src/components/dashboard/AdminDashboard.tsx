import { useState, useEffect } from "react";
import { adminService } from "../../services/admin.service";
import { api } from "../../services/api";
import {
  ShieldCheck,
  Users,
  Search,
  UserPlus,
  Trash2,
  Edit,
  ShieldAlert,
  GraduationCap,
  BookOpen,
  Shield,
  KeyRound,
  Loader2,
} from "lucide-react";

export const AdminDashboard = () => {
  // ==========================================
  // OBTENER ID DEL USUARIO ACTUAL (Para SuperAdmin)
  // ==========================================
  const storageString = localStorage.getItem('auth-storage');
  let miId: number | null = null;
  if (storageString) {
    try {
      miId = JSON.parse(storageString)?.state?.user?.id;
    } catch (e) {
      console.error("Error leyendo ID del admin");
    }
  }

  // ==========================================
  // ESTADOS: GESTIÓN DE USUARIOS
  // ==========================================
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [filtroRol, setFiltroRol] = useState<string>("TODOS");
  const [busqueda, setBusqueda] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState<any>(null);
  const [formData, setFormData] = useState({
    nombreCompleto: "",
    email: "",
    password: "", 
    rol: "PROFESOR",
  });

  // ==========================================
  // ESTADOS: CAMBIO DE CONTRASEÑA
  // ==========================================
  const [passwordActual, setPasswordActual] = useState('');
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [mensajePassword, setMensajePassword] = useState<{ tipo: 'error' | 'exito', texto: string } | null>(null);
  
  // Memoria del navegador: Si ya la cambió antes, iniciamos ocultando el formulario
  const [ocultarFormulario, setOcultarFormulario] = useState(
    localStorage.getItem('admin_pwd_changed') === 'true'
  ); 
  // Controla el banner de éxito solo en la sesión actual
  const [mostrarExito, setMostrarExito] = useState(false);

  // ==========================================
  // EFECTOS Y LÓGICA DE USUARIOS
  // ==========================================
  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    try {
      const res = await adminService.getAllUsers();
      setUsuarios(res.data);
    } catch (error) {
      console.error("Error al cargar la base de datos", error);
    }
  };

  const usuariosFiltrados = usuarios.filter((u) => {
    const coincideRol = filtroRol === "TODOS" || u.rol === filtroRol;
    const coincideBusqueda =
      u.nombreCompleto?.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.email.toLowerCase().includes(busqueda.toLowerCase());
    return coincideRol && coincideBusqueda;
  });

  const totalProfesores = usuarios.filter((u) => u.rol === "PROFESOR").length;
  const totalAlumnos = usuarios.filter((u) => u.rol === "ALUMNO").length;

  const handleGuardarUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (usuarioEditando) {
        await adminService.updateUser(usuarioEditando.id, formData);
      } else {
        await adminService.createUser(formData);
      }
      setIsModalOpen(false);
      setUsuarioEditando(null);
      fetchUsuarios(); 
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al guardar los datos del usuario');
    }
  };

  const handleEliminar = async (id: number) => {
    if (window.confirm("🚨 ¿ESTÁS SEGURO? Se borrará todo el rastro de este usuario.")) {
      try {
        await adminService.deleteUser(id);
        fetchUsuarios();
      } catch (error: any) {
        // Aprovechamos para mostrar el error del backend si intenta saltarse las reglas
        alert(error.response?.data?.message || 'Error al eliminar usuario');
      }
    }
  };

  const handleHacerAdmin = async (id: number) => {
    if (window.confirm("¿Estás seguro de darle PODER ABSOLUTO a este usuario?")) {
      try {
        await adminService.promoteToAdmin(id);
        fetchUsuarios();
      } catch (error) {
        console.error(error);
      }
    }
  };

  // ==========================================
  // LÓGICA: CAMBIO DE CONTRASEÑA
  // ==========================================
  const handleCambiarPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensajePassword(null);

    if (nuevaPassword !== confirmarPassword) {
      setMensajePassword({ tipo: 'error', texto: 'Las nuevas contraseñas no coinciden.' });
      return;
    }

    if (nuevaPassword.length < 6) {
      setMensajePassword({ tipo: 'error', texto: 'La nueva contraseña debe tener al menos 6 caracteres.' });
      return;
    }

    setLoadingPassword(true);

    try {
      await api.put('/auth/cambiar-password', {
        passwordActual,
        nuevaPassword
      });

      // Guardamos el éxito en la memoria del navegador para siempre
      localStorage.setItem('admin_pwd_changed', 'true');
      
      // Ocultamos formulario y mostramos éxito en la sesión actual
      setOcultarFormulario(true);
      setMostrarExito(true);
      
    } catch (error: any) {
      setMensajePassword({ 
        tipo: 'error', 
        texto: error.response?.data?.message || 'Error al cambiar la contraseña' 
      });
      setLoadingPassword(false);
    } 
  };

  return (
    <div className="space-y-8">
      
      {/* ========================================== */}
      {/* SECCIÓN: SEGURIDAD                         */}
      {/* ========================================== */}
      
      {/* 1. Si no la ha cambiado en esta máquina, mostramos alerta y formulario */}
      {!ocultarFormulario && (
        <div className="space-y-6">
          <div className="bg-yellow-50 border-4 border-yellow-400 p-6 rounded-3xl shadow-[8px_8px_0px_0px_rgba(250,204,21,1)] flex flex-col md:flex-row items-start gap-4">
            <div className="bg-yellow-400 p-3 rounded-2xl flex-shrink-0">
              <ShieldAlert className="w-8 h-8 text-yellow-900" />
            </div>
            <div>
              <h2 className="text-xl font-black text-yellow-900 mb-1">¡Atención, Administrador!</h2>
              <p className="text-yellow-800 font-bold">
                Si aún estás usando la contraseña temporal de la instalación, cámbiala inmediatamente en el panel de abajo por motivos de seguridad.
              </p>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border-4 border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] max-w-3xl">
            <h3 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
              <KeyRound className="w-8 h-8 text-blue-500" />
              Forjar Nueva Contraseña
            </h3>

            {mensajePassword && (
              <div className="p-4 rounded-xl font-bold mb-6 border-4 flex items-center gap-3 bg-red-50 text-red-700 border-red-500">
                {mensajePassword.texto}
              </div>
            )}

            <form onSubmit={handleCambiarPassword} className="space-y-5">
              <div>
                <label className="block text-sm font-black text-slate-800 mb-2 uppercase tracking-wider">
                  Contraseña Actual
                </label>
                <input 
                  type="password" 
                  required
                  value={passwordActual}
                  onChange={(e) => setPasswordActual(e.target.value)}
                  className="w-full px-5 py-3 bg-slate-50 border-4 border-slate-200 rounded-xl focus:border-blue-600 focus:bg-white text-slate-900 font-bold outline-none transition-all"
                  placeholder="Escribe tu contraseña actual..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-black text-slate-800 mb-2 uppercase tracking-wider">
                    Nueva Contraseña
                  </label>
                  <input 
                    type="password" 
                    required
                    value={nuevaPassword}
                    onChange={(e) => setNuevaPassword(e.target.value)}
                    className="w-full px-5 py-3 bg-slate-50 border-4 border-slate-200 rounded-xl focus:border-blue-600 focus:bg-white text-slate-900 font-bold outline-none transition-all"
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>
                <div>
                  <label className="block text-sm font-black text-slate-800 mb-2 uppercase tracking-wider">
                    Confirmar Nueva
                  </label>
                  <input 
                    type="password" 
                    required
                    value={confirmarPassword}
                    onChange={(e) => setConfirmarPassword(e.target.value)}
                    className="w-full px-5 py-3 bg-slate-50 border-4 border-slate-200 rounded-xl focus:border-blue-600 focus:bg-white text-slate-900 font-bold outline-none transition-all"
                    placeholder="Repite la nueva contraseña"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loadingPassword}
                className={`w-full py-4 text-xl font-black rounded-xl border-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:translate-x-1 active:shadow-none transition-all mt-4 ${
                  loadingPassword 
                    ? 'bg-slate-300 border-slate-500 text-slate-500 cursor-not-allowed shadow-[6px_6px_0px_0px_rgba(100,116,139,1)]' 
                    : 'bg-blue-600 border-blue-800 text-white hover:bg-blue-500 shadow-[6px_6px_0px_0px_rgba(30,58,138,1)]'
                }`}
              >
                {loadingPassword ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : 'Actualizar Contraseña'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2. Si la acaba de cambiar en ESTA sesión, mostramos el éxito */}
      {mostrarExito && (
        <div className="bg-green-50 border-4 border-green-500 p-6 rounded-3xl shadow-[8px_8px_0px_0px_rgba(34,197,94,1)] flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
          <div className="bg-green-500 p-3 rounded-2xl flex-shrink-0">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-black text-green-900 mb-1">¡Seguridad al Máximo!</h2>
            <p className="text-green-800 font-bold">
              Tu contraseña ha sido actualizada correctamente. Tu cuenta maestra ahora está blindada.
            </p>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* SECCIÓN: GESTIÓN DE USUARIOS               */}
      {/* ========================================== */}
      <div className="bg-slate-800 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
        {/* BANNER DE ADMINISTRACIÓN */}
        <div className="bg-slate-800 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <h2 className="text-3xl font-black mb-2 tracking-tight flex items-center">
                <ShieldCheck className="w-8 h-8 mr-3 text-emerald-400" />
                Centro de Mando
              </h2>
              <p className="text-slate-300 text-lg">
                Control total sobre el sistema. Gestiona cuentas, roles y accesos de EduPlay.
              </p>
            </div>

            <div className="flex gap-4">
              <div className="bg-slate-700/50 backdrop-blur border border-slate-600 rounded-xl p-4 text-center">
                <p className="text-3xl font-black text-white">
                  {totalProfesores}
                </p>
                <p className="text-xs uppercase tracking-widest text-slate-400 font-bold mt-1">
                  Profesores
                </p>
              </div>
              <div className="bg-slate-700/50 backdrop-blur border border-slate-600 rounded-xl p-4 text-center">
                <p className="text-3xl font-black text-white">{totalAlumnos}</p>
                <p className="text-xs uppercase tracking-widest text-slate-400 font-bold mt-1">
                  Alumnos
                </p>
              </div>
            </div>
          </div>
          <ShieldAlert className="absolute -right-10 -bottom-10 w-64 h-64 text-slate-700 opacity-20 transform -rotate-12" />
        </div>

        {/* BARRA DE HERRAMIENTAS Y FILTROS */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col lg:flex-row justify-between gap-4 mt-8 text-slate-900">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por nombre o email..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-500 font-medium"
              />
            </div>

            <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-200 overflow-x-auto">
              {["TODOS", "ADMIN", "PROFESOR", "ALUMNO", "PADRE"].map((rol) => (
                <button
                  key={rol}
                  onClick={() => setFiltroRol(rol)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${
                    filtroRol === rol
                      ? "bg-white shadow-sm text-slate-800"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {rol}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => {
              setUsuarioEditando(null);
              setFormData({
                nombreCompleto: "",
                email: "",
                password: "",
                rol: "PROFESOR",
              });
              setIsModalOpen(true);
            }}
            className="flex items-center justify-center bg-slate-800 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-slate-900 shadow-md transition-all"
          >
            <UserPlus className="w-5 h-5 mr-2" /> Alta Manual
          </button>
        </div>

        {/* TABLA DE USUARIOS */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mt-6 text-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-black">
                  <th className="p-4">Usuario</th>
                  <th className="p-4">Rol</th>
                  <th className="p-4">Email de Acceso</th>
                  <th className="p-4 text-right">Acciones Peligrosas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {usuariosFiltrados.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="p-8 text-center text-gray-500 font-medium"
                    >
                      No se encontraron usuarios con esos filtros.
                    </td>
                  </tr>
                ) : (
                  usuariosFiltrados.map((u) => (
                    <tr
                      key={u.id}
                      className="hover:bg-gray-50 transition-colors group"
                    >
                      <td className="p-4 font-bold text-gray-900 flex items-center">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center mr-3 text-slate-500">
                          {u.rol === "ADMIN" ? (
                            <Shield className="w-4 h-4 text-emerald-500" />
                          ) : u.rol === "PROFESOR" ? (
                            <BookOpen className="w-4 h-4" />
                          ) : u.rol === "ALUMNO" ? (
                            <GraduationCap className="w-4 h-4" />
                          ) : (
                            <Users className="w-4 h-4" />
                          )}
                        </div>
                        {u.nombreCompleto || "Sin nombre"}
                      </td>
                      <td className="p-4">
                        <span
                          className={`text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-widest ${
                            u.rol === "ADMIN"
                              ? "bg-emerald-100 text-emerald-700"
                              : u.rol === "PROFESOR"
                                ? "bg-blue-100 text-blue-700"
                                : u.rol === "ALUMNO"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-purple-100 text-purple-700"
                          }`}
                        >
                          {u.rol}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-sm text-gray-600">
                        {u.email}
                      </td>

                      <td className="p-4 text-right space-x-2">
                        {/* Botón Hacer Admin: Solo visible si NO es admin */}
                        {u.rol !== "ADMIN" && (
                          <button
                            onClick={() => handleHacerAdmin(u.id)}
                            className="p-2 bg-white border border-gray-200 text-emerald-600 rounded-lg hover:bg-emerald-50 hover:border-emerald-200 transition-colors"
                            title="Hacer Administrador"
                          >
                            <ShieldCheck className="w-4 h-4" />
                          </button>
                        )}

                        {/* Botón Editar: Siempre visible */}
                        <button
                          onClick={() => {
                            setUsuarioEditando(u);
                            setFormData({
                              ...formData,
                              nombreCompleto: u.nombreCompleto || "",
                              email: u.email,
                              rol: u.rol,
                            });
                            setIsModalOpen(true);
                          }}
                          className="p-2 bg-white border border-gray-200 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                          title="Editar Usuario"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        {/* Botón Eliminar (NUEVA LÓGICA DE SUPERADMIN) */}
                        {/* No se puede borrar al ID 1 NUNCA. Si es ADMIN, solo el miId===1 puede verlo */}
                        {u.id !== 1 && (u.rol !== "ADMIN" || miId === 1) && (
                          <button
                            onClick={() => handleEliminar(u.id)}
                            className="p-2 bg-white border border-gray-200 text-red-600 rounded-lg hover:bg-red-50 hover:border-red-200 transition-colors"
                            title="Eliminar Cuenta"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* MODAL CREAR / EDITAR USUARIO                 */}
      {/* ========================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl text-slate-900">
            <h3 className="text-2xl font-black text-gray-800 mb-6 flex items-center">
              {usuarioEditando ? (
                <Edit className="w-6 h-6 mr-2 text-slate-500" />
              ) : (
                <UserPlus className="w-6 h-6 mr-2 text-slate-500" />
              )}
              {usuarioEditando ? "Editar Usuario" : "Registrar Nuevo Usuario"}
            </h3>

            <form onSubmit={handleGuardarUsuario} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  required
                  value={formData.nombreCompleto}
                  onChange={(e) =>
                    setFormData({ ...formData, nombreCompleto: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-500 text-slate-900 font-bold placeholder-slate-400"
                  placeholder="Ej. Juan Pérez"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-500 text-slate-900 font-bold placeholder-slate-400"
                  placeholder="ejemplo@correo.com"
                />
              </div>

              {!usuarioEditando && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-500 text-slate-900 font-bold"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">
                  Rol del Sistema
                </label>
                <select
                  value={formData.rol}
                  onChange={(e) =>
                    setFormData({ ...formData, rol: e.target.value })
                  }
                  disabled={!!usuarioEditando} 
                  className={`w-full px-4 py-3 border border-slate-200 rounded-xl font-bold transition-colors ${
                    usuarioEditando
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                      : 'bg-white focus:ring-2 focus:ring-slate-500 text-slate-900' 
                  }`}
                >
                  <option value="PROFESOR" className="text-slate-900 font-medium">
                    Profesor
                  </option>
                  <option value="ALUMNO" className="text-slate-900 font-medium">
                    Alumno
                  </option>
                  <option value="PADRE" className="text-slate-900 font-medium">
                    Familiar
                  </option>
                  <option value="ADMIN" className="text-slate-900 font-medium">
                    Administrador Superior
                  </option>
                </select>
                {usuarioEditando && (
                  <p className="text-[10px] text-slate-400 mt-1 font-medium">
                    El rol no se puede modificar para proteger la integridad de los datos.
                  </p>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-slate-800 font-bold text-white rounded-xl hover:bg-slate-900 transition-colors shadow-md"
                >
                  {usuarioEditando ? "Guardar Cambios" : "Crear Usuario"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};