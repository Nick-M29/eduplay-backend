import { api } from './api';

export const obtenerComentarios = async (materialId: number) => {
  // Le añadimos el /api al principio
  const response = await api.get(`/api/materiales/${materialId}/comentarios`);
  return response.data;
};

export const crearComentario = async (materialId: number, texto: string, parentId?: number) => {
  // Pasamos el parentId en el body
  const response = await api.post(`/api/materiales/${materialId}/comentarios`, { texto, parentId });
  return response.data;
};
