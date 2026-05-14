import React, { useState, useRef } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import logoFull from '../assets/logofull.jpg';
import heroProfesor from '../assets/hero-profesor.png';

export const LandingPage = () => {
  const [cookiesAceptadas, setCookiesAceptadas] = useState(false);
  const [modalLegal, setModalLegal] = useState<'privacidad' | 'terminos' | null>(null);

  // Refs para capturar los datos del formulario de contacto
  const nombreRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const mensajeRef = useRef<HTMLTextAreaElement>(null);

  const handleContacto = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Obtenemos los valores de los refs
    const formData = {
      nombre: nombreRef.current?.value,
      email: emailRef.current?.value,
      mensaje: mensajeRef.current?.value
    };

    try {
      // Petición POST al endpoint que creamos en el backend
      const response = await axios.post('http://localhost:3000/api/contacto', formData);
      
      // Si el backend responde bien, avisamos al usuario
      alert(`¡Mensaje enviado con éxito, ${formData.nombre}! Revisaremos tu consulta pronto.`);
      
      // Limpiamos el formulario físicamente
      if (nombreRef.current) nombreRef.current.value = '';
      if (emailRef.current) emailRef.current.value = '';
      if (mensajeRef.current) mensajeRef.current.value = '';
      
    } catch (error) {
      console.error("Error al enviar mensaje de contacto:", error);
      alert('Hubo un error al enviar el mensaje. Por favor, comprueba que el servidor esté encendido.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      
      {/* 1. HERO SECTION */}
      <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-teal-500 relative pb-20 lg:pb-32">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>

        <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto relative z-10">
          <div className="flex items-center">
            <div className="bg-white p-2 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,0.15)] transform hover:scale-105 transition-transform">
              <img src={logoFull} alt="EduPlay Logo" className="h-10 md:h-12 object-contain" />
            </div>
          </div>
          <div className="space-x-4 font-bold flex items-center">
            <Link to="/login" className="text-white hover:text-yellow-300 transition-colors">Iniciar Sesión</Link>
            <Link to="/register" className="px-6 py-2.5 bg-yellow-400 text-yellow-900 rounded-xl hover:bg-yellow-300 transition-all shadow-[4px_4px_0px_0px_rgba(161,98,7,1)] active:shadow-none active:translate-y-1 active:translate-x-1">
              Registrarse
            </Link>
          </div>
        </nav>

        <header className="max-w-7xl mx-auto px-6 pt-12 lg:pt-20 flex flex-col lg:flex-row items-center gap-12 relative z-10">
          <div className="lg:w-1/2 text-center lg:text-left">
            <div className="inline-block px-5 py-2 bg-yellow-400 text-yellow-900 font-black rounded-full mb-6 border-2 border-yellow-600 shadow-[4px_4px_0px_0px_rgba(161,98,7,1)] uppercase tracking-wider text-sm">
              🚀 Empieza la aventura
            </div>
            <h1 className="text-5xl lg:text-7xl font-black tracking-tight text-white mb-6 leading-tight drop-shadow-md">
              Aprender nunca había sido <br/>
              <span className="text-yellow-400">
                tan divertido.
              </span>
            </h1>
            <p className="text-xl text-blue-50 mb-10 max-w-2xl mx-auto lg:mx-0 font-medium leading-relaxed">
              La plataforma educativa que transforma el aula en una aventura épica. Gana experiencia, sube de nivel y desbloquea recompensas mientras aprendes.
            </p>
            <Link to="/register" className="inline-block px-8 py-4 bg-green-500 text-slate-900 text-xl font-black rounded-2xl hover:bg-green-400 transition-all shadow-[6px_6px_0px_0px_rgba(21,128,61,1)] active:shadow-none active:translate-y-1 active:translate-x-1 border-4 border-green-700">
              Comenzar gratis
            </Link>
          </div>

          <div className="lg:w-1/2 w-full mt-10 lg:mt-0 relative">
            <img 
              src={heroProfesor} 
              alt="Profesor usando EduPlay" 
              className="w-full rounded-3xl border-4 border-white shadow-[12px_12px_0px_0px_rgba(0,0,0,0.2)] object-cover aspect-video transform hover:-translate-y-2 transition-transform duration-300"
            />
            <div className="absolute -bottom-6 -left-6 bg-white border-4 border-slate-900 p-4 rounded-2xl shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] transform rotate-[-5deg]">
              <span className="text-2xl block text-center">⭐</span>
              <span className="font-black text-slate-900 block mt-1">+500 XP</span>
            </div>
          </div>
        </header>
      </div>

      {/* 2. MISIÓN Y VISIÓN */}
      <section className="bg-white py-24 relative z-10">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-black mb-12 text-slate-900">Nuestra Misión y Visión</h2>
          <div className="grid md:grid-cols-2 gap-8 text-left">
            <div className="p-10 bg-white rounded-3xl shadow-[8px_8px_0px_0px_rgba(59,130,246,1)] border-4 border-blue-500 hover:-translate-y-2 transition-transform duration-300">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-3xl mb-6 font-black border-2 border-blue-300">🎯</div>
              <h3 className="text-3xl font-black mb-4 text-slate-900">Misión</h3>
              <p className="font-medium text-slate-600 text-lg leading-relaxed">Empoderar a profesores y alumnos a través de la gamificación, creando un entorno donde la motivación y el progreso académico vayan de la mano.</p>
            </div>
            <div className="p-10 bg-white rounded-3xl shadow-[8px_8px_0px_0px_rgba(34,197,94,1)] border-4 border-green-500 hover:-translate-y-2 transition-transform duration-300">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center text-3xl mb-6 font-black border-2 border-green-300">👁️</div>
              <h3 className="text-3xl font-black mb-4 text-slate-900">Visión</h3>
              <p className="font-medium text-slate-600 text-lg leading-relaxed">Convertirnos en el estándar de la educación, donde el esfuerzo se premia, los talentos se descubren y la comunidad escolar colabora.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CARACTERÍSTICAS */}
      <section className="bg-slate-50 max-w-7xl mx-auto px-6 py-24 text-center rounded-3xl my-12 border-4 border-slate-100">
        <h2 className="text-4xl font-black mb-16 text-slate-900">Todo lo que puedes hacer</h2>
        <div className="grid md:grid-cols-3 gap-8 text-left">
          <div className="p-8 bg-white rounded-3xl border-4 border-blue-400 shadow-[6px_6px_0px_0px_rgba(96,165,250,1)] hover:-translate-y-2 transition-transform duration-300">
            <div className="text-5xl mb-6 bg-blue-50 w-20 h-20 flex items-center justify-center rounded-2xl border-2 border-blue-200">👨‍🏫</div>
            <h3 className="text-2xl font-black mb-3 text-slate-900">Profesores</h3>
            <p className="text-slate-600 font-medium text-lg leading-relaxed">Crea misiones, asigna experiencia, evalúa y gestiona a tus alumnos fácilmente.</p>
          </div>
          <div className="p-8 bg-white rounded-3xl border-4 border-purple-400 shadow-[6px_6px_0px_0px_rgba(192,132,252,1)] hover:-translate-y-2 transition-transform duration-300">
            <div className="text-5xl mb-6 bg-purple-50 w-20 h-20 flex items-center justify-center rounded-2xl border-2 border-purple-200">🎮</div>
            <h3 className="text-2xl font-black mb-3 text-slate-900">Alumnos</h3>
            <p className="text-slate-600 font-medium text-lg leading-relaxed">Sube de nivel, personaliza tu perfil, canjea recompensas y compite de forma sana.</p>
          </div>
          <div className="p-8 bg-white rounded-3xl border-4 border-orange-400 shadow-[6px_6px_0px_0px_rgba(251,146,60,1)] hover:-translate-y-2 transition-transform duration-300">
            <div className="text-5xl mb-6 bg-orange-50 w-20 h-20 flex items-center justify-center rounded-2xl border-2 border-orange-200">👨‍👩‍👧</div>
            <h3 className="text-2xl font-black mb-3 text-slate-900">Familias</h3>
            <p className="text-slate-600 font-medium text-lg leading-relaxed">Sigue el progreso en tiempo real y recibe notificaciones de los logros.</p>
          </div>
        </div>
      </section>

      {/* 4. SECCIÓN DE CONTACTO (Aquí conectamos los Refs y la Función) */}
      <section id="contacto" className="py-24 px-6 bg-slate-900 mt-12 relative">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-green-500"></div>
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-3xl shadow-[12px_12px_0px_0px_rgba(59,130,246,0.3)] border-4 border-slate-700 overflow-hidden flex flex-col md:flex-row">
            <div className="bg-blue-600 p-10 md:w-5/12 text-white flex flex-col justify-center border-b-4 md:border-b-0 md:border-r-4 border-slate-700">
              <h2 className="text-4xl font-black mb-4">¿Tienes dudas?</h2>
              <p className="font-medium text-blue-100 mb-8 text-lg">Escríbenos y nuestro equipo te responderá rápido para ayudarte a implementar EduPlay.</p>
              <div className="space-y-4 font-bold text-lg">
                <p className="flex items-center gap-3"><span className="bg-blue-800 p-2 rounded-lg">📧</span> eduplay.contact@gmail.com</p>
                <p className="flex items-center gap-3"><span className="bg-blue-800 p-2 rounded-lg">📍</span> Madrid, España</p>
              </div>
            </div>
            <div className="p-10 md:w-7/12 bg-slate-50">
              {/* ASIGNAMOS LA FUNCIÓN HANDLECONTACTO AL SUBMIT */}
              <form className="space-y-5" onSubmit={handleContacto}>
                <div>
                  <label className="block text-sm font-black text-slate-800 mb-2 uppercase">Nombre Completo</label>
                  <input 
                    ref={nombreRef} 
                    type="text" 
                    className="w-full px-5 py-4 bg-white border-4 border-slate-200 rounded-xl focus:border-blue-500 text-slate-900 font-bold outline-none transition-all" 
                    required 
                    placeholder="Ej. Juan Pérez" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-black text-slate-800 mb-2 uppercase">Correo Electrónico</label>
                  <input 
                    ref={emailRef} 
                    type="email" 
                    className="w-full px-5 py-4 bg-white border-4 border-slate-200 rounded-xl focus:border-blue-500 text-slate-900 font-bold outline-none transition-all" 
                    required 
                    placeholder="tu@email.com" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-black text-slate-800 mb-2 uppercase">Mensaje</label>
                  <textarea 
                    ref={mensajeRef} 
                    rows={3} 
                    className="w-full px-5 py-4 bg-white border-4 border-slate-200 rounded-xl focus:border-blue-500 text-slate-900 font-bold outline-none transition-all" 
                    required 
                    placeholder="¿En qué podemos ayudarte?"
                  ></textarea>
                </div>
                <button type="submit" className="w-full py-4 bg-green-500 text-slate-900 text-xl font-black rounded-xl border-4 border-green-700 shadow-[6px_6px_0px_0px_rgba(21,128,61,1)] hover:bg-green-400 active:translate-y-1 active:translate-x-1 active:shadow-none transition-all">
                  Enviar Mensaje
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FOOTER */}
      <footer className="bg-slate-950 text-slate-400 py-12 text-center text-sm font-bold">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-3 mb-6 md:mb-0">
            <div className="bg-white p-2 rounded-xl">
              <img src={logoFull} alt="EduPlay Logo" className="h-8 object-contain" />
            </div>
          </div>
          <p className="mb-6 md:mb-0">© 2026 EduPlay. Todos los derechos reservados.</p>
          <div className="space-x-6 flex flex-wrap justify-center gap-y-4">
            <a href="#contacto" className="hover:text-white transition-colors cursor-pointer uppercase tracking-wider text-xs">Contacto</a>
            <button onClick={() => setModalLegal('privacidad')} className="hover:text-white transition-colors uppercase tracking-wider text-xs">Privacidad</button>
            <button onClick={() => setModalLegal('terminos')} className="hover:text-white transition-colors uppercase tracking-wider text-xs">Términos</button>
          </div>
        </div>
      </footer>

      {/* AVISO COOKIES */}
      {!cookiesAceptadas && (
        <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-96 bg-white border-4 border-slate-900 rounded-2xl p-6 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)] z-50">
          <div className="text-4xl mb-3">🍪</div>
          <h4 className="font-black text-xl text-slate-900 mb-2">Aviso de Cookies</h4>
          <p className="text-sm text-slate-600 font-bold mb-5">
            Utilizamos cookies para que la plataforma funcione al 100%. Sin trucos raros.
          </p>
          <button onClick={() => setCookiesAceptadas(true)} className="w-full py-3 bg-blue-600 text-white font-black rounded-xl border-4 border-blue-800 shadow-[4px_4px_0px_0px_rgba(30,58,138,1)] hover:bg-blue-500 active:translate-y-1 active:translate-x-1 active:shadow-none transition-all">
            ¡Vale, acepto!
          </button>
        </div>
      )}

      {/* MODALES LEGALES */}
      {modalLegal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-6 z-[60]" onClick={() => setModalLegal(null)}>
          <div className="bg-white w-full max-w-2xl rounded-3xl p-8 max-h-[85vh] overflow-y-auto border-4 border-slate-900 shadow-[16px_16px_0px_0px_rgba(0,0,0,0.5)]" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-8 border-b-4 border-slate-100 pb-4">
              <h3 className="text-3xl font-black text-slate-900">
                {modalLegal === 'privacidad' ? 'Política de Privacidad' : 'Términos de Uso'}
              </h3>
              <button onClick={() => setModalLegal(null)} className="text-slate-400 hover:text-red-500 text-4xl font-black transition-colors">&times;</button>
            </div>
            <div className="prose prose-slate text-slate-700 font-medium space-y-4">
              {modalLegal === 'privacidad' ? (
                <>
                  <p>En EduPlay valoramos tu privacidad. Esta política explica cómo recopilamos, usamos y protegemos tu información.</p>
                  <p><strong className="text-slate-900">1. Recopilación de datos:</strong> Recopilamos tu nombre, correo y rol dentro del sistema para poder crear tu cuenta y asociarte a las clases.</p>
                  <p><strong className="text-slate-900">2. Uso de la información:</strong> Tu información solo se utiliza para gestionar tu progreso en la plataforma, otorgar puntos y facilitar la comunicación.</p>
                </>
              ) : (
                <>
                  <p>Al utilizar EduPlay, aceptas los siguientes términos y condiciones de uso.</p>
                  <p><strong className="text-slate-900">1. Uso adecuado:</strong> Te comprometes a usar la plataforma de manera respetuosa con otros estudiantes y profesores.</p>
                  <p><strong className="text-slate-900">2. Cuentas de usuario:</strong> Eres responsable de mantener la confidencialidad de tus contraseñas y accesos.</p>
                </>
              )}
            </div>
            <button onClick={() => setModalLegal(null)} className="mt-8 w-full py-4 bg-slate-900 text-white text-xl font-black rounded-xl border-4 border-slate-900 hover:bg-slate-800 transition-colors">
              Cerrar
            </button>
          </div>
        </div>
      )}

    </div>
  );
};