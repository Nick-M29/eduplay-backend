import { api } from './api';

export const classService = {
  createClass: async (nombreClase: string) => {
    const res = await api.post('/clases', { nombreClase: nombreClase });
    return res.data;
  },
  joinClass: async (codigoClase: string, claveIngreso: string, alumnoId?: number) => {
    const res = await api.post('/clases/unirse', { codigoClase, claveIngreso, alumnoId });
    return res.data;
  },
  linkStudent: async (codigoAcceso: string) => {
    const res = await api.post('/clases/vincular-alumno', { codigoAcceso });
    return res.data;
  },
  getMyClasses: async () => {
    const res = await api.get('/clases/mis-clases');
    return res.data;
  },
  getMateriales: async (claseId: number | string) => {
    const res = await api.get(`/clases/${claseId}/materiales`);
    return res.data;
  },
  createMaterial: async (claseId: number | string, payload: any) => {
    const res = await api.post(`/clases/${claseId}/materiales`, payload);
    return res.data;
  },
  getChatHistory: async (claseId: number | string) => {
    const res = await api.get(`/clases/${claseId}/chat`);
    return res.data;
  },
  getAlumnos: async (claseId: number | string) => {
    const res = await api.get(`/clases/${claseId}/alumnos`);
    return res.data;
  }
};
