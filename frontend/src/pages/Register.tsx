import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../services/api";
import {
  BookOpen,
  Users,
  GraduationCap,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Navbar } from "../components/layout/Navbar";
type Rol = "PROFESOR" | "PADRE" | "ALUMNO" | null;

export const Register = () => {
  const [selectedRol, setSelectedRol] = useState<Rol>(null);

  // Form state
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // const login = useAuthStore((state) => state.login); // Ya no hacemos auto-login aquí
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRol) return;

    setError("");
    setIsLoading(true);

    try {
      const payload: any = {
        rol: selectedRol,
        nombreCompleto,
        email,
        password
      };

      if (selectedRol === 'PROFESOR' || selectedRol === 'PADRE') {
        payload.fechaNacimiento = fechaNacimiento;
      }

      // 1. Registrar usuario
      await api.post('/auth/register', payload);

      // --- DETECTOR DE ADMINISTRADOR ---
      // Verificamos si somos un Admin usando el store o el localStorage
      const storage = JSON.parse(localStorage.getItem('auth-storage') || '{}');
      const isAdmin = storage.state?.user?.rol === 'ADMIN';

      if (isAdmin) {
        // Si es Admin, NO navegamos. Solo avisamos y limpiamos.
        alert(`Usuario ${email} creado correctamente.`);
        
        // Limpiamos los campos para que puedas crear otro
        setNombreCompleto('');
        setEmail('');
        setPassword('');
        setFechaNacimiento('');
        setSelectedRol(null); 
      } else {
        // Si es un usuario normal, sí va a verificar
        navigate('/verificar', { state: { email } });
      }
      
    } catch (err: any) {
      if (err.response?.data?.errors) {
        // Formatear errores de validación de Zod del backend
        const mensajes = err.response.data.errors
          .map((e: any) => e.message)
          .join(" | ");
        setError(`Error: ${mensajes}`);
      } else {
        setError(
          err.response?.data?.message ||
            "Ocurrió un error al registrarse. Intenta de nuevo.",
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const RoleCard = ({
    rol,
    icon: Icon,
    title,
    desc,
  }: {
    rol: Rol;
    icon: any;
    title: string;
    desc: string;
  }) => (
    <div
      onClick={() => {
        setSelectedRol(rol);
        setError("");
      }}
      className={`cursor-pointer transition-all duration-300 rounded-xl p-6 border-2 flex flex-col items-center text-center gap-3 ${
        selectedRol === rol
          ? "border-primary-500 bg-primary-50 shadow-md transform scale-105"
          : "border-gray-200 hover:border-primary-300 hover:bg-gray-50"
      }`}
    >
      <div
        className={`p-4 rounded-full transition-colors ${selectedRol === rol ? "bg-primary-500 text-white" : "bg-gray-100 text-gray-500"}`}
      >
        <Icon className="w-8 h-8" />
      </div>
      <div>
        <h3
          className={`font-bold text-lg ${selectedRol === rol ? "text-primary-800" : "text-gray-700"}`}
        >
          {title}
        </h3>
        <p className="text-sm text-gray-500 mt-1 leading-tight">{desc}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-1 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">
              Únete a EduPlay
            </h2>
            <p className="mt-3 text-lg text-gray-600">
              ¿Ya tienes cuenta?{" "}
              <Link
                to="/login"
                className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
              >
                Inicia sesión aquí
              </Link>
            </p>
          </div>

          {/* Tarjetas de Selección de Rol */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <RoleCard
              rol="PROFESOR"
              icon={BookOpen}
              title="Soy Profesor"
              desc="Crea clases, sube material y evalúa a tus alumnos."
            />
            <RoleCard
              rol="PADRE"
              icon={Users}
              title="Soy Padre"
              desc="Sigue el progreso y conecta con los profesores."
            />
            <RoleCard
              rol="ALUMNO"
              icon={GraduationCap}
              title="Soy Alumno"
              desc="Aprende, gana puntos y chatea con compañeros."
            />
          </div>

          {/* Formulario Dinámico Animado */}
          {selectedRol && (
            <div className="bg-white py-8 px-6 shadow-xl sm:rounded-xl sm:px-10 border border-gray-100 max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h3 className="text-2xl font-bold text-center mb-6 text-gray-800">
                Registro como{" "}
                <span className="text-primary-600 capitalize">
                  {selectedRol.toLowerCase()}
                </span>
              </h3>

              <form className="space-y-5" onSubmit={handleSubmit}>
                {error && (
                  <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md flex items-start">
                    <AlertCircle className="w-5 h-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    required
                    value={nombreCompleto}
                    onChange={(e) => setNombreCompleto(e.target.value)}
                    className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="Ej. Juan Pérez"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="ejemplo@correo.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>

                {/* Fecha de Nacimiento condicional */}
                {(selectedRol === "PROFESOR" || selectedRol === "PADRE") && (
                  <div className="animate-in fade-in slide-in-from-left-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Fecha de Nacimiento
                    </label>
                    <input
                      type="date"
                      required
                      value={fechaNacimiento}
                      onChange={(e) => setFechaNacimiento(e.target.value)}
                      className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Por políticas de seguridad, debes ser mayor de 18 años.
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-70 transition-all mt-4"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Crear Cuenta"
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
