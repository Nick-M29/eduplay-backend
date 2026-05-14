import axios from 'axios';

// Usamos la variable de entorno de Vite. Si no existe (ej. en Vercel si se nos olvida ponerla), 
// usa directamente tu URL de producción en Render.
const API_URL = import.meta.env.VITE_API_URL || 'https://eduplay-backend-wcdv.onrender.com';

// Instancia configurada para apuntar al backend de EduPlay
export const api = axios.create({
  baseURL: API_URL, // Aquí aplicamos el cambio
  timeout: 10000,
});

// Interceptor de peticiones para inyectar automáticamente el token JWT
api.interceptors.request.use(
  (config) => {
    // Obtenemos el token directamente desde el almacenamiento persistente de Zustand
    const authStorage = localStorage.getItem('auth-storage');
    
    if (authStorage) {
      try {
        const { state } = JSON.parse(authStorage);
        if (state.token) {
          config.headers.Authorization = `Bearer ${state.token}`;
        }
      } catch (error) {
        console.error('Error parseando token de Zustand:', error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);