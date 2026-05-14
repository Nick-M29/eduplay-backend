import { api } from './api'; // Ajusta la ruta de tu axios configurado si es necesario

export const tareasService = {
  // 1. Obtener todas las tareas de la clase
  obtenerTareasClase: async (claseId: string) => {
    const response = await api.get(`/api/tareas/clase/${claseId}`);
    return response.data;
  },

  // 2. Crear una nueva tarea (solo profe)
  crearTarea: async (claseId: string, data: any) => {
    const response = await api.post(`/api/tareas/clase/${claseId}`, data);
    return response.data;
  },

  // 3. Evaluar una entrega (+XP / -XP) (solo profe)
  evaluarEntrega: async (entregaId: number, estado: 'APROBADA' | 'RECHAZADA') => {
    const response = await api.post(`/api/tareas/entregas/${entregaId}/evaluar`, { estado });
    return response.data;
  } ,

  // 4. Enviar entrega (solo alumno)
  enviarEntrega: async (entregaId: number, contenido: string) => {
    const response = await api.post(`/api/tareas/entregas/${entregaId}/entregar`, { contenido });
    return response.data;
  },

  // 5. Eliminar tarea (solo profe)
  eliminarTarea: async (tareaId: number) => {
    const response = await api.delete(`/api/tareas/${tareaId}`);
    return response.data;
  }
};