import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Las mismas estructuras del backend
export type RolUsuario = 'PROFESOR' | 'PADRE' | 'ALUMNO';

export interface User {
  id: number;
  email: string;
  rol: RolUsuario;
  nombreCompleto?: string;
  codigoAcceso?: string;
  puntos?: number;
  avatarJson?: any;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  
  // Acciones para modificar el estado
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
}

// Creamos el store global de autenticación con Zustand
// persist() nos ayuda a guardar la sesión en el localStorage automáticamente
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,

      login: (token, user) => set({ 
        token, 
        user, 
        isAuthenticated: true 
      }),

      logout: () => set({ 
        token: null, 
        user: null, 
        isAuthenticated: false 
      }),
      updateUser: (data) => set((state) => ({
        user: state.user ? { ...state.user, ...data } : null
      }))
    }),
    {
      name: 'auth-storage', // Key bajo la que se guardará en localStorage
    }
  )
);
