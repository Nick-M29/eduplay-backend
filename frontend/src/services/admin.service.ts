// Importamos tu instancia de Axios ya configurada (ajusta la ruta si no están en la misma carpeta)
import { api } from './api'; 

export const adminService = {
  getAllUsers: async () => {
    // La URL base y el token ya se añaden automáticamente gracias a api.ts
    const response = await api.get('/admin/usuarios');
    return response;
  },
  
  deleteUser: async (id: number) => {
    const response = await api.delete(`/admin/usuarios/${id}`);
    return response;
  },
  
  promoteToAdmin: async (id: number) => {
    const response = await api.patch(`/admin/usuarios/${id}/admin`);
    return response;
  },

  createUser: async (userData: any) => {
    const response = await api.post('/admin/usuarios', userData);
    return response;
  },

  updateUser: async (id: number, userData: any) => {
    const response = await api.put(`/admin/usuarios/${id}`, userData);
    return response;
  }
};