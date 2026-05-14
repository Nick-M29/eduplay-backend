import { api } from './api'; 

export const adminService = {
  getAllUsers: async () => {
    // Añadimos /api a la ruta
    const response = await api.get('/api/admin/usuarios');
    return response;
  },
  
  deleteUser: async (id: number) => {
    const response = await api.delete(`/api/admin/usuarios/${id}`);
    return response;
  },
  
  promoteToAdmin: async (id: number) => {
    const response = await api.patch(`/api/admin/usuarios/${id}/admin`);
    return response;
  },

  createUser: async (userData: any) => {
    const response = await api.post('/api/admin/usuarios', userData);
    return response;
  },

  updateUser: async (id: number, userData: any) => {
    const response = await api.put(`/api/admin/usuarios/${id}`, userData);
    return response;
  }
};