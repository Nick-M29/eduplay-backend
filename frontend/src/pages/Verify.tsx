import React, { useState, useRef, useEffect } from "react";
import { api } from "../services/api";
import { useNavigate, useLocation } from "react-router-dom";

export const Verify = () => {
  const [codigo, setCodigo] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const navigate = useNavigate();
  const location = useLocation();

  // Obtenemos el email que pasamos por el estado del Router (desde Register o Login)
  const email = location.state?.email;

  // Si alguien entra a /verify sin un email, lo mandamos al login
  useEffect(() => {
    if (!email) {
      navigate("/login");
    }
  }, [email, navigate]);

  const handleChange = (index: number, value: string) => {
    // Solo permitimos números
    if (!/^[0-9]*$/.test(value)) return;

    const newCodigo = [...codigo];
    newCodigo[index] = value;
    setCodigo(newCodigo);

    // Auto-focus a la siguiente casilla si escribió un número
    if (value !== "" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    // Si pulsa borrar y la casilla está vacía, vuelve a la casilla anterior
    if (e.key === "Backspace" && codigo[index] === "" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const codigoCompleto = codigo.join("");

    if (codigoCompleto.length < 6) {
      setError("Por favor, introduce los 6 dígitos.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await api.post("/api/verificar", {
        email,
        codigo: codigoCompleto,
      });

      alert("¡Nivel desbloqueado! Tu cuenta está activa.");
      navigate("/login"); // Lo mandamos al login para que entre con su cuenta activa
    } catch (err: any) {
      setError(err.response?.data?.message || "Código incorrecto o expirado.");
      // Limpiamos las casillas para que lo intente de nuevo
      setCodigo(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6 relative overflow-hidden">
      {/* Luces de fondo estilo gamificado */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-400 rounded-full mix-blend-multiply filter blur-[150px] opacity-40 animate-pulse"></div>
      <div
        className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-green-400 rounded-full mix-blend-multiply filter blur-[150px] opacity-40 animate-pulse"
        style={{ animationDelay: "2s" }}
      ></div>

      <div className="bg-white max-w-md w-full rounded-3xl p-8 border-4 border-slate-900 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)] relative z-10 text-center">
        <div className="w-20 h-20 bg-yellow-100 border-4 border-yellow-400 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-6 shadow-[4px_4px_0px_0px_rgba(234,179,8,1)] transform -rotate-6">
          🔐
        </div>

        <h2 className="text-3xl font-black text-slate-900 mb-2">
          Código Secreto
        </h2>
        <p className="text-slate-600 font-bold mb-8">
          Hemos enviado un código a <br />
          <span className="text-blue-600">{email}</span>
        </p>

        {error && (
          <div className="bg-red-100 text-red-700 font-bold p-3 rounded-xl mb-6 border-2 border-red-500 animate-bounce">
            ❌ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="flex justify-between gap-2 mb-8">
            {codigo.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-16 md:w-14 md:h-20 text-center text-3xl font-black text-slate-900 bg-slate-50 border-4 border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white outline-none transition-all shadow-sm focus:shadow-[4px_4px_0px_0px_rgba(59,130,246,1)] focus:-translate-y-1"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 text-xl font-black rounded-xl border-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:translate-x-1 active:shadow-none transition-all ${
              loading
                ? "bg-slate-300 border-slate-500 text-slate-500 cursor-not-allowed shadow-[6px_6px_0px_0px_rgba(100,116,139,1)]"
                : "bg-green-500 border-green-700 text-slate-900 hover:bg-green-400 shadow-[6px_6px_0px_0px_rgba(21,128,61,1)]"
            }`}
          >
            {loading ? "Verificando..." : "Desbloquear Cuenta"}
          </button>
        </form>

        <p className="mt-6 text-sm font-bold text-slate-500">
          ¿No lo encuentras? Revisa tu carpeta de Spam.
        </p>
      </div>
    </div>
  );
};
