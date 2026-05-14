import axios from 'axios';

// Ajusta esta URL a la que uses en tu backend (ej. http://localhost:3000/api)
const API_URL = 'http://localhost:3000/api/admin'; 

// Configuramos Axios para enviar el token de sesión (si usas JWT)
const getConfig = () => {
  // 1. Buscamos el "cajón" de Zustand
  const storageString = localStorage.getItem('auth-storage');
  let token = null;

  // 2. Si el cajón existe, lo abrimos (parseamos) para sacar el token
  if (storageString) {
    try {
      const storageObj = JSON.parse(storageString);
      // Navegamos por la estructura que se ve en tu captura: state -> token
      token = storageObj?.state?.token; 
    } catch (e) {
      console.error("Error al leer el token de Zustand", e);
    }
  }

  // 3. Se lo pasamos a Axios limpio
  return { headers: { Authorization: `Bearer ${token}` } };
};

export const adminService = {
  getAllUsers: async () => {
    const response = await axios.get(`${API_URL}/usuarios`, getConfig());
    return response;
  },
  
  deleteUser: async (id: number) => {
    const response = await axios.delete(`${API_URL}/usuarios/${id}`, getConfig());
    return response;
  },
  
  promoteToAdmin: async (id: number) => {
    const response = await axios.patch(`${API_URL}/usuarios/${id}/admin`, {}, getConfig());
    return response;
  },

  createUser: async (userData: any) => {
    const response = await axios.post(`${API_URL}/usuarios`, userData, getConfig());
    return response;
  },

  updateUser: async (id: number, userData: any) => {
    const response = await axios.put(`${API_URL}/usuarios/${id}`, userData, getConfig());
    return response;
  }
};