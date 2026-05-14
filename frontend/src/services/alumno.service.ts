import { api } from './api';

export const alumnoService = {
  updatePuntos: async (alumnoId: number | string, puntosAAgregar: number) => {
    const res = await api.post(`/alumnos/${alumnoId}/puntos`, { puntos: puntosAAgregar });
    return res.data;
  },
  updatePerfil: async (alumnoId: number | string, avatarJson: any) => {
    const res = await api.put(`/alumnos/${alumnoId}/perfil`, { avatarJson });
    return res.data;
  }
};
