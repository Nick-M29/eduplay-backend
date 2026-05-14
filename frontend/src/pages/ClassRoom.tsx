import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { classService } from "../services/class.service";
import { ChatBox } from "../components/chat/ChatBox";
import {
  BookOpen,
  FileText,
  Send,
  AlertCircle,
  ArrowLeft,
  Users,
  PlusCircle,
  MinusCircle,
  Trophy,
} from "lucide-react";
import { alumnoService } from "../services/alumno.service";
import ComentariosMaterial from "../components/ComentariosMaterial";
import { tareasService } from "../services/tareas.service";
import {
  ClipboardList,
  Clock,
  CheckCircle,
  XCircle,
  Trash2,
} from "lucide-react";
import { api } from "../services/api";

export const ClassRoom = () => {
  const { clase_id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [activeTab, setActiveTab] = useState<
    "MATERIALES" | "ALUMNOS" | "TAREAS"
  >("MATERIALES");
  const [materiales, setMateriales] = useState<any[]>([]);
  const [alumnos, setAlumnos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [tareas, setTareas] = useState<any[]>([]);

  // Formulario Material (Solo Profesor)
  const [titulo, setTitulo] = useState("");
  const [contenido, setContenido] = useState("");
  const [audiencia, setAudiencia] = useState<"ALUMNOS" | "PADRES" | "AMBOS">(
    "AMBOS",
  );
  const [creando, setCreando] = useState(false);
  const [respuestasAlumnos, setRespuestasAlumnos] = useState<
    Record<number, string>
  >({});
  const [nuevaTarea, setNuevaTarea] = useState({
    titulo: "",
    descripcion: "",
    fechaLimite: "",
    recompensaXP: 50,
    penalizacionXP: 10,
    esGrupal: false,
    tamanoGrupo: 3,
  });

  const fetchMateriales = async () => {
    try {
      const res = await classService.getMateriales(clase_id!);
      setMateriales(res.data);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Error al cargar materiales (¿Tienes acceso a esta clase?)",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAlumnos = async () => {
    try {
      const res = await classService.getAlumnos(clase_id!);
      setAlumnos(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTareas = async () => {
    try {
      const res = await tareasService.obtenerTareasClase(clase_id!);
      console.log("DATOS DE LAS TAREAS:", res);
      console.log("LISTA DE ALUMNOS:", alumnos);
      setTareas(res);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteMaterial = async (id: number) => {
    if (
      !window.confirm(
        "¿Estás seguro de que quieres eliminar este material? Esta acción no se puede deshacer.",
      )
    )
      return;
    try {
      await api.delete(`/api/materiales/${id}`); // Ajusta la ruta a tu API de materiales
      fetchMateriales(); // Recargamos la lista
    } catch (error) {
      console.error("Error eliminando material", error);
    }
  };

  const handleDeleteTarea = async (id: number) => {
    if (
      !window.confirm(
        "¿Estás seguro de que quieres eliminar esta tarea? Se perderán todas las entregas de los alumnos.",
      )
    )
      return;
    try {
      await tareasService.eliminarTarea(id);
      fetchTareas(); // Recargamos la lista
    } catch (error) {
      console.error("Error eliminando tarea", error);
    }
  };

  useEffect(() => {
    if (clase_id) {
      fetchMateriales();
      fetchTareas();
      if (user?.rol === "PROFESOR") fetchAlumnos();
    }
  }, [clase_id, user?.rol]);

  const handleCreateMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clase_id) return;
    setCreando(true);
    try {
      await classService.createMaterial(clase_id, {
        titulo,
        contenido,
        audiencia,
      });
      setTitulo("");
      setContenido("");
      setAudiencia("AMBOS");
      fetchMateriales(); // Recargar la lista
    } catch (err: any) {
      alert(err.response?.data?.message || "Error al crear material");
    } finally {
      setCreando(false);
    }
  };

  const handlePoints = async (alumnoId: number, puntos: number) => {
    try {
      await alumnoService.updatePuntos(alumnoId, puntos);
      fetchAlumnos(); // Recargar la lista para ver los nuevos puntos
    } catch (err: any) {
      alert(err.response?.data?.message || "Error al actualizar puntos");
    }
  };

  if (isLoading)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-primary-600 font-bold animate-pulse">
        Cargando entorno de clase...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ========================================== */}
      {/* NAVBAR ESPECÍFICA DEL AULA                 */}
      {/* ========================================== */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => navigate("/dashboard")}
              className="mr-4 text-gray-500 hover:text-primary-600 transition-colors p-1 rounded-full hover:bg-primary-50"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <BookOpen className="w-6 h-6 text-primary-600 mr-2" />
            <h1 className="text-xl font-bold text-gray-800 tracking-tight">
              Aula Virtual
            </h1>
          </div>
          <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-bold border border-gray-200">
            ID: {clase_id}
          </span>
        </div>
      </div>

      {/* ========================================== */}
      {/* CONTENIDO PRINCIPAL                        */}
      {/* ========================================== */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8">
        {error ? (
          <div className="bg-red-50 border border-red-200 p-6 rounded-xl flex items-center justify-center shadow-sm">
            <AlertCircle className="w-6 h-6 text-red-500 mr-3" />
            <p className="text-red-700 font-medium text-lg">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* ========================================== */}
            {/* COLUMNA IZQUIERDA: CONTENIDO Y PESTAÑAS    */}
            {/* ========================================== */}
            <div className="lg:col-span-2 space-y-8">
              {/* MENÚ DE PESTAÑAS */}
              <div className="flex space-x-2 border-b border-gray-200 mb-6 overflow-x-auto">
                <button
                  onClick={() => setActiveTab("MATERIALES")}
                  className={`px-4 py-3 font-bold text-sm flex items-center transition-colors border-b-2 whitespace-nowrap ${
                    activeTab === "MATERIALES"
                      ? "border-primary-600 text-primary-600 bg-primary-50 rounded-t-lg"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-t-lg"
                  }`}
                >
                  <FileText className="w-4 h-4 mr-2" /> Materiales
                </button>

                <button
                  onClick={() => setActiveTab("TAREAS")}
                  className={`px-4 py-3 font-bold text-sm flex items-center transition-colors border-b-2 whitespace-nowrap ${
                    activeTab === "TAREAS"
                      ? "border-primary-600 text-primary-600 bg-primary-50 rounded-t-lg"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-t-lg"
                  }`}
                >
                  <ClipboardList className="w-4 h-4 mr-2" /> Tareas
                </button>

                {user?.rol === "PROFESOR" && (
                  <button
                    onClick={() => setActiveTab("ALUMNOS")}
                    className={`px-4 py-3 font-bold text-sm flex items-center transition-colors border-b-2 whitespace-nowrap ${
                      activeTab === "ALUMNOS"
                        ? "border-primary-600 text-primary-600 bg-primary-50 rounded-t-lg"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-t-lg"
                    }`}
                  >
                    <Users className="w-4 h-4 mr-2" /> Alumnos
                  </button>
                )}
              </div>

              {/* ========================================== */}
              {/* 1. PESTAÑA: ALUMNOS (Solo Profesor)        */}
              {/* ========================================== */}
              {activeTab === "ALUMNOS" && user?.rol === "PROFESOR" && (
                <div className="animate-in fade-in duration-300">
                  <h3 className="text-2xl font-black text-gray-800 mb-6 flex items-center">
                    <Trophy className="w-6 h-6 text-yellow-500 mr-2" /> Gestión
                    de Puntos
                  </h3>
                  <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                    {alumnos.length === 0 ? (
                      <div className="p-8 text-center text-gray-500">
                        No hay alumnos inscritos en esta clase aún.
                      </div>
                    ) : (
                      <ul className="divide-y divide-gray-100">
                        {alumnos.map((alumno) => (
                          <li
                            key={alumno.usuarioId}
                            className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center">
                              <div
                                className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3 border border-gray-300 overflow-hidden"
                                style={
                                  alumno.avatarJson
                                    ? {
                                        backgroundColor:
                                          alumno.avatarJson.bgColor,
                                      }
                                    : {}
                                }
                              >
                                {alumno.avatarJson?.photo ? (
                                  <img
                                    src={alumno.avatarJson.photo}
                                    className="w-full h-full object-cover"
                                    alt="Avatar"
                                  />
                                ) : (
                                  <span
                                    className="text-xl"
                                    style={{
                                      color: alumno.avatarJson?.iconColor,
                                    }}
                                  >
                                    {alumno.avatarJson?.iconType === "ROBOT"
                                      ? "🤖"
                                      : alumno.avatarJson?.iconType === "ZORRO"
                                        ? "🦊"
                                        : alumno.avatarJson?.iconType ===
                                            "NINJA"
                                          ? "🥷"
                                          : "🎓"}
                                  </span>
                                )}
                              </div>
                              <div>
                                <p className="font-bold text-gray-900">
                                  {alumno.nombreCompleto}
                                </p>
                                <p className="text-xs text-yellow-600 font-bold bg-yellow-50 inline-block px-2 py-0.5 rounded-full mt-1 border border-yellow-200">
                                  {alumno.puntos} XP
                                </p>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() =>
                                  handlePoints(alumno.usuarioId, -5)
                                }
                                className="flex items-center px-3 py-1.5 bg-red-50 text-red-600 font-bold text-xs rounded-lg border border-red-200 hover:bg-red-100 transition"
                              >
                                <MinusCircle className="w-3 h-3 mr-1" /> 5
                              </button>
                              <button
                                onClick={() =>
                                  handlePoints(alumno.usuarioId, 10)
                                }
                                className="flex items-center px-3 py-1.5 bg-green-50 text-green-600 font-bold text-xs rounded-lg border border-green-200 hover:bg-green-100 transition"
                              >
                                <PlusCircle className="w-3 h-3 mr-1" /> 10
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}

              {/* ========================================== */}
              {/* 2. PESTAÑA: MATERIALES                     */}
              {/* ========================================== */}
              {activeTab === "MATERIALES" && (
                <div className="animate-in fade-in duration-300 space-y-8">
                  {/* Formulario Crear Material (Solo Profesores) */}
                  {user?.rol === "PROFESOR" && (
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-md">
                      <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center">
                        <FileText className="w-5 h-5 mr-2 text-primary-500" />
                        Publicar Nuevo Material Didáctico
                      </h3>
                      <form
                        onSubmit={handleCreateMaterial}
                        className="space-y-5"
                      >
                        <div>
                          <input
                            type="text"
                            required
                            placeholder="Título del material..."
                            value={titulo}
                            onChange={(e) => setTitulo(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all font-medium text-gray-800"
                          />
                        </div>
                        <div>
                          <textarea
                            required
                            placeholder="Escribe las instrucciones, avisos o el contenido de la clase aquí..."
                            value={contenido}
                            onChange={(e) => setContenido(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all min-h-[120px] resize-y text-gray-700 leading-relaxed"
                          />
                        </div>
                        <div className="flex flex-col sm:flex-row items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-100">
                          <div className="w-full sm:w-auto flex items-center mb-3 sm:mb-0">
                            <span className="text-sm font-medium text-gray-600 mr-3">
                              Para:
                            </span>
                            <select
                              value={audiencia}
                              onChange={(e) =>
                                setAudiencia(e.target.value as any)
                              }
                              className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 focus:ring-2 focus:ring-primary-500 shadow-sm cursor-pointer outline-none"
                            >
                              <option value="AMBOS">Alumnos y Padres</option>
                              <option value="ALUMNOS">Solo Alumnos</option>
                              <option value="PADRES">Solo Padres</option>
                            </select>
                          </div>
                          <button
                            type="submit"
                            disabled={creando}
                            className="w-full sm:w-auto bg-primary-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-primary-700 shadow-md transition-all flex items-center justify-center disabled:opacity-70"
                          >
                            <Send className="w-4 h-4 mr-2" />
                            {creando ? "Publicando..." : "Publicar"}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Feed de Materiales */}
                  <div>
                    <h3 className="text-2xl font-black text-gray-800 mb-6 tracking-tight">
                      Tablón de Anuncios
                    </h3>
                    {materiales.length === 0 ? (
                      <div className="bg-white p-12 text-center rounded-2xl border-2 border-dashed border-gray-200 text-gray-500 flex flex-col items-center">
                        <FileText className="w-12 h-12 text-gray-300 mb-3" />
                        <p className="font-medium text-lg">
                          Aún no hay publicaciones en esta clase.
                        </p>
                        <p className="text-sm">
                          Todo el material didáctico aparecerá aquí.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {materiales.map((m) => (
                          <div
                            key={m.id}
                            className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
                          >
                            <div
                              className={`absolute left-0 top-0 bottom-0 w-1 ${
                                m.audiencia === "AMBOS"
                                  ? "bg-purple-500"
                                  : m.audiencia === "ALUMNOS"
                                    ? "bg-blue-500"
                                    : "bg-orange-500"
                              }`}
                            ></div>

                            <div className="flex justify-between items-start mb-4">
                              <h4 className="text-xl font-bold text-gray-900 leading-tight">
                                {m.titulo}
                              </h4>

                              <div className="flex items-center">
                                <span
                                  className={`text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-widest ml-4 shadow-sm ${
                                    m.audiencia === "AMBOS"
                                      ? "bg-purple-100 text-purple-700"
                                      : m.audiencia === "ALUMNOS"
                                        ? "bg-blue-100 text-blue-800"
                                        : "bg-orange-100 text-orange-800"
                                  }`}
                                >
                                  {m.audiencia}
                                </span>
                                {/* Botón de eliminar Material (Solo Profe) */}
                                {user?.rol === "PROFESOR" && (
                                  <button
                                    onClick={() => handleDeleteMaterial(m.id)}
                                    className="text-gray-300 hover:text-red-500 transition-colors ml-3 p-1.5 rounded-full hover:bg-red-50"
                                    title="Eliminar material"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </div>

                            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-[15px]">
                              {m.contenido}
                            </p>

                            <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center text-xs text-gray-400 font-medium">
                              <span>
                                Publicado el{" "}
                                {new Date(
                                  m.fechaPublicacion,
                                ).toLocaleDateString()}{" "}
                                a las{" "}
                                {new Date(
                                  m.fechaPublicacion,
                                ).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                            <ComentariosMaterial materialId={m.id} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ========================================== */}
              {/* 3. PESTAÑA: TAREAS                         */}
              {/* ========================================== */}
              {activeTab === "TAREAS" && (
                <div className="animate-in fade-in duration-300 space-y-8">
                  {/* Formulario Profesor para Tareas */}
                  {user?.rol === "PROFESOR" && (
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                      <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center">
                        <ClipboardList className="w-5 h-5 mr-2 text-primary-500" />
                        Asignar Nueva Tarea
                      </h3>
                      <form
                        onSubmit={async (e) => {
                          e.preventDefault();
                          await tareasService.crearTarea(clase_id!, nuevaTarea);
                          fetchTareas();
                          setNuevaTarea({
                            ...nuevaTarea,
                            titulo: "",
                            descripcion: "",
                          });
                        }}
                        className="space-y-4"
                      >
                        <input
                          type="text"
                          required
                          placeholder="Título de la tarea..."
                          value={nuevaTarea.titulo}
                          onChange={(e) =>
                            setNuevaTarea({
                              ...nuevaTarea,
                              titulo: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500"
                        />
                        <textarea
                          required
                          placeholder="Instrucciones detalladas..."
                          value={nuevaTarea.descripcion}
                          onChange={(e) =>
                            setNuevaTarea({
                              ...nuevaTarea,
                              descripcion: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 min-h-[100px]"
                        />

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">
                              Recompensa (XP)
                            </label>
                            <input
                              type="number"
                              required
                              value={nuevaTarea.recompensaXP}
                              onChange={(e) =>
                                setNuevaTarea({
                                  ...nuevaTarea,
                                  recompensaXP: parseInt(e.target.value),
                                })
                              }
                              className="w-full px-4 py-2 border border-gray-200 rounded-lg text-green-600 font-bold"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">
                              Penalización (-XP)
                            </label>
                            <input
                              type="number"
                              required
                              value={nuevaTarea.penalizacionXP}
                              onChange={(e) =>
                                setNuevaTarea({
                                  ...nuevaTarea,
                                  penalizacionXP: parseInt(e.target.value),
                                })
                              }
                              className="w-full px-4 py-2 border border-gray-200 rounded-lg text-red-600 font-bold"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">
                              Fecha Límite
                            </label>
                            <input
                              type="datetime-local"
                              required
                              value={nuevaTarea.fechaLimite}
                              onChange={(e) =>
                                setNuevaTarea({
                                  ...nuevaTarea,
                                  fechaLimite: e.target.value,
                                })
                              }
                              className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between bg-blue-50 p-4 rounded-xl border border-blue-100 mt-2">
                          <label className="flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={nuevaTarea.esGrupal}
                              onChange={(e) =>
                                setNuevaTarea({
                                  ...nuevaTarea,
                                  esGrupal: e.target.checked,
                                })
                              }
                              className="w-5 h-5 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                            />
                            <span className="ml-3 font-bold text-blue-900">
                              ¿Es un trabajo en grupos aleatorios?
                            </span>
                          </label>

                          {nuevaTarea.esGrupal && (
                            <div className="flex items-center">
                              <span className="text-sm font-medium text-blue-800 mr-2">
                                Alumnos por grupo:
                              </span>
                              <input
                                type="number"
                                min="2"
                                max="10"
                                value={nuevaTarea.tamanoGrupo}
                                onChange={(e) =>
                                  setNuevaTarea({
                                    ...nuevaTarea,
                                    tamanoGrupo: parseInt(e.target.value),
                                  })
                                }
                                className="w-16 px-2 py-1 border border-blue-200 rounded-md text-center font-bold"
                              />
                            </div>
                          )}
                        </div>

                        <button
                          type="submit"
                          className="w-full bg-primary-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-700 shadow-md transition-all"
                        >
                          Publicar Tarea
                        </button>
                      </form>
                    </div>
                  )}

                  {/* Vista Alumno: Lista de Tareas Personales */}
                  {user?.rol === "ALUMNO" && (
                    <div className="space-y-4">
                      <h3 className="text-2xl font-black text-gray-800 mb-6 tracking-tight">
                        Tus Tareas
                      </h3>
                      {tareas.length === 0 ? (
                        <div className="bg-white p-12 text-center rounded-2xl border-2 border-dashed border-gray-200 text-gray-500 flex flex-col items-center">
                          <ClipboardList className="w-12 h-12 text-gray-300 mb-3" />
                          <p className="font-medium text-lg">
                            No hay tareas asignadas.
                          </p>
                        </div>
                      ) : (
                        tareas.map((tarea: any) => {
                          const miEntrega = tarea.entregas?.find(
                            (e: any) =>
                              e.alumnoId === user?.id ||
                              (tarea.esGrupal &&
                                e.grupo?.alumnos?.some(
                                  (a: any) =>
                                    a.id === user?.id ||
                                    a.usuarioId === user?.id,
                                )),
                          );

                          if (!miEntrega) return null;

                          return (
                            <div
                              key={tarea.id}
                              className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm"
                            >
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="text-xl font-bold text-gray-900">
                                  {tarea.titulo}
                                </h4>
                                <div className="flex space-x-2">
                                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">
                                    +{tarea.recompensaXP} XP
                                  </span>
                                  <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">
                                    -{tarea.penalizacionXP} XP
                                  </span>
                                </div>
                              </div>

                              <p className="text-gray-600 text-sm mb-4">
                                {tarea.descripcion}
                              </p>

                              <div className="flex items-center text-xs font-bold text-orange-600 bg-orange-50 w-fit px-3 py-1.5 rounded-lg border border-orange-100 mb-6">
                                <Clock className="w-4 h-4 mr-1.5" /> Vence:{" "}
                                {new Date(tarea.fechaLimite).toLocaleString()}
                              </div>

                              {/* Panel de envío del alumno */}
                              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                <div className="flex justify-between items-center mb-3">
                                  <span className="font-bold text-sm text-gray-700">
                                    Tu entrega{" "}
                                    {tarea.esGrupal &&
                                      `(Grupo: ${miEntrega.grupo?.nombre})`}
                                  </span>
                                  <span
                                    className={`text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-widest ${
                                      miEntrega.estado === "PENDIENTE"
                                        ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                                        : miEntrega.estado === "ENTREGADA"
                                          ? "bg-blue-100 text-blue-800 border border-blue-200"
                                          : miEntrega.estado === "APROBADA"
                                            ? "bg-green-100 text-green-800 border border-green-200"
                                            : "bg-red-100 text-red-800 border border-red-200"
                                    }`}
                                  >
                                    {miEntrega.estado}
                                  </span>
                                </div>

                                {miEntrega.estado === "PENDIENTE" ? (
                                  <form
                                    onSubmit={async (e) => {
                                      e.preventDefault();
                                      await tareasService.enviarEntrega(
                                        miEntrega.id,
                                        respuestasAlumnos[miEntrega.id] || "",
                                      );
                                      fetchTareas();
                                    }}
                                  >
                                    <textarea
                                      required
                                      placeholder="Escribe tu respuesta o pega el enlace a tu trabajo..."
                                      value={
                                        respuestasAlumnos[miEntrega.id] || ""
                                      }
                                      onChange={(e) =>
                                        setRespuestasAlumnos({
                                          ...respuestasAlumnos,
                                          [miEntrega.id]: e.target.value,
                                        })
                                      }
                                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 mb-3 min-h-[100px]"
                                    />
                                    <button
                                      type="submit"
                                      className="flex items-center justify-center w-full sm:w-auto bg-primary-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-primary-700 transition-all"
                                    >
                                      <Send className="w-4 h-4 mr-2" /> Enviar
                                      Tarea
                                    </button>
                                  </form>
                                ) : (
                                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                                    <p className="text-gray-600 text-sm whitespace-pre-wrap">
                                      {miEntrega.contenido}
                                    </p>
                                    {miEntrega.fechaEntrega && (
                                      <p className="text-xs text-gray-400 mt-3 font-medium">
                                        Enviado el{" "}
                                        {new Date(
                                          miEntrega.fechaEntrega,
                                        ).toLocaleString()}
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}

                  {/* Vista Profesor: Feed global de Tareas Activas y Panel de Evaluación */}
                  {user?.rol === "PROFESOR" && (
                    <div className="space-y-4">
                      <h3 className="text-2xl font-black text-gray-800 mb-6 tracking-tight">
                        Tareas Activas
                      </h3>
                      {tareas.length === 0 ? (
                        <div className="bg-white p-12 text-center rounded-2xl border-2 border-dashed border-gray-200 text-gray-500 flex flex-col items-center">
                          <ClipboardList className="w-12 h-12 text-gray-300 mb-3" />
                          <p className="font-medium text-lg">
                            Aún no hay tareas publicadas.
                          </p>
                        </div>
                      ) : (
                        tareas.map((tarea: any) => (
                          <div
                            key={tarea.id}
                            className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="text-xl font-bold text-gray-900">
                                {tarea.titulo}
                              </h4>
                              <div className="flex items-center space-x-2">
                                <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">
                                  +{tarea.recompensaXP} XP
                                </span>
                                <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">
                                  -{tarea.penalizacionXP} XP
                                </span>
                                {/* Botón de eliminar Tarea (Solo Profe) */}
                                <button
                                  onClick={() => handleDeleteTarea(tarea.id)}
                                  className="text-gray-300 hover:text-red-500 transition-colors ml-2 p-1.5 rounded-md hover:bg-red-50"
                                  title="Eliminar tarea"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            <p className="text-gray-600 text-sm mb-4">
                              {tarea.descripcion}
                            </p>

                            <div className="flex items-center text-xs font-bold text-orange-600 bg-orange-50 w-fit px-3 py-1.5 rounded-lg border border-orange-100 mb-4">
                              <Clock className="w-4 h-4 mr-1.5" /> Vence:{" "}
                              {new Date(tarea.fechaLimite).toLocaleString()}
                            </div>

                            {/* Panel de Evaluación de Entregas (Solo visible para Profe) */}
                            {tarea.entregas && tarea.entregas.length > 0 && (
                              <div className="mt-6 border-t border-gray-100 pt-4">
                                <h5 className="font-bold text-sm text-gray-700 mb-3">
                                  Panel de Evaluación
                                </h5>
                                <div className="space-y-3">
                                  {tarea.entregas.map((entrega: any) => {
                                    const alumnoInfo = alumnos.find(
                                      (a) => a.usuarioId === entrega.alumnoId,
                                    );
                                    const nombreFinal =
                                      alumnoInfo?.nombreCompleto ||
                                      entrega.nombreMostrar ||
                                      `Alumno (ID: ${entrega.alumnoId || "Desconocido"})`;

                                    return (
                                      <div
                                        key={entrega.id}
                                        className="flex flex-col bg-gray-50 p-3 rounded-lg border border-gray-200 gap-3"
                                      >
                                        {/* Fila superior: Nombre, Etiqueta y Botones */}
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                          <div>
                                            <span className="font-semibold text-sm text-gray-800">
                                              {tarea.esGrupal
                                                ? `👥 ${entrega.grupo?.nombre || "Equipo"}`
                                                : `👤 ${nombreFinal}`}
                                            </span>
                                            <span
                                              className={`ml-3 text-[10px] font-black px-2 py-0.5 rounded uppercase ${
                                                entrega.estado === "PENDIENTE"
                                                  ? "bg-yellow-100 text-yellow-700"
                                                  : entrega.estado ===
                                                      "ENTREGADA"
                                                    ? "bg-blue-100 text-blue-700"
                                                    : entrega.estado ===
                                                        "APROBADA"
                                                      ? "bg-green-100 text-green-700"
                                                      : "bg-red-100 text-red-700"
                                              }`}
                                            >
                                              {entrega.estado}
                                            </span>
                                          </div>

                                          {(entrega.estado === "PENDIENTE" ||
                                            entrega.estado === "ENTREGADA") && (
                                            <div className="flex space-x-2">
                                              <button
                                                onClick={async () => {
                                                  await tareasService.evaluarEntrega(
                                                    entrega.id,
                                                    "APROBADA",
                                                  );
                                                  fetchTareas();
                                                  fetchAlumnos();
                                                }}
                                                className="flex items-center text-xs font-bold bg-green-50 text-green-600 hover:bg-green-100 px-3 py-1.5 rounded-lg border border-green-200 transition"
                                              >
                                                <CheckCircle className="w-4 h-4 mr-1" />{" "}
                                                Aprobar
                                              </button>
                                              <button
                                                onClick={async () => {
                                                  await tareasService.evaluarEntrega(
                                                    entrega.id,
                                                    "RECHAZADA",
                                                  );
                                                  fetchTareas();
                                                  fetchAlumnos();
                                                }}
                                                className="flex items-center text-xs font-bold bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-lg border border-red-200 transition"
                                              >
                                                <XCircle className="w-4 h-4 mr-1" />{" "}
                                                Rechazar
                                              </button>
                                            </div>
                                          )}
                                        </div>

                                        {/* Fila inferior: Contenido de la entrega si existe */}
                                        {entrega.contenido && (
                                          <div className="mt-1 p-3 bg-white border border-gray-200 rounded-md shadow-sm">
                                            <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                              {entrega.contenido}
                                            </p>
                                            {entrega.fechaEntrega && (
                                              <p className="text-[10px] text-gray-400 mt-2 font-semibold">
                                                Enviado el{" "}
                                                {new Date(
                                                  entrega.fechaEntrega,
                                                ).toLocaleString()}
                                              </p>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ========================================== */}
            {/* COLUMNA DERECHA: CHAT                      */}
            {/* ========================================== */}
            <div className="lg:col-span-1 sticky top-24 h-fit">
              {user?.rol === "ALUMNO" ? (
                <ChatBox claseId={clase_id!} />
              ) : (
                <div className="bg-gray-50 p-8 rounded-2xl border-2 border-dashed border-gray-300 text-center flex flex-col items-center justify-center h-[600px]">
                  <div className="bg-gray-200 p-4 rounded-full mb-4">
                    <AlertCircle className="w-8 h-8 text-gray-500" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">
                    Chat de Alumnos
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    El sistema de mensajería instantánea está restringido. Es un
                    espacio privado y exclusivo para que los alumnos interactúen
                    entre sí sobre la materia.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
