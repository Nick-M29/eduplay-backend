import axios from 'axios';

// Instancia configurada para apuntar al backend de EduPlay
export const api = axios.create({
  baseURL: 'http://localhost:3000',
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
